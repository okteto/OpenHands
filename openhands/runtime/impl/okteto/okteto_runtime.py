from functools import lru_cache
from typing import Callable

import requests
import tenacity

from openhands.core.config import AppConfig
from openhands.core.logger import DEBUG, DEBUG_RUNTIME
from openhands.core.logger import openhands_logger as logger
from openhands.events import EventStream
from openhands.runtime.impl.action_execution.action_execution_client import (
    ActionExecutionClient,
)
from openhands.runtime.impl.docker.containers import stop_all_containers
from openhands.runtime.plugins import PluginRequirement
from openhands.runtime.utils import find_available_tcp_port
from openhands.runtime.utils.command import get_action_execution_server_startup_command
from openhands.runtime.utils.log_streamer import LogStreamer
from openhands.runtime.utils.runtime_build import build_runtime_image
from openhands.utils.async_utils import call_sync_from_async
from openhands.utils.shutdown_listener import add_shutdown_listener
from openhands.utils.tenacity_stop import stop_if_should_exit

class OktetoRuntime(ActionExecutionClient):
    """This runtime will subscribe the event stream.

    When receive an event, it will send the event to runtime-client which run inside the okteto environment.

    Args:
        config (AppConfig): The application configuration.
        event_stream (EventStream): The event stream to subscribe to.
        sid (str, optional): The session ID. Defaults to 'default'.
        plugins (list[PluginRequirement] | None, optional): List of plugin requirements. Defaults to None.
        env_vars (dict[str, str] | None, optional): Environment variables to set. Defaults to None.
    """

    # _shutdown_listener_id: UUID | None = None

    def __init__(
        self,
        config: AppConfig,
        event_stream: EventStream,
        sid: str = 'default',
        plugins: list[PluginRequirement] | None = None,
        env_vars: dict[str, str] | None = None,
        status_callback: Callable | None = None,
        attach_to_existing: bool = False,
        headless_mode: bool = True,
    ):

        self.config = config
        self.status_callback = status_callback

        self._app_ports: list[int] = []

        self.api_url = "http://localhost:37455"

        # Buffer for container logs
        self.log_streamer: LogStreamer | None = None

        super().__init__(
            config,
            event_stream,
            sid,
            plugins,
            env_vars,
            status_callback,
            attach_to_existing,
            headless_mode,
        )

    def _get_action_execution_server_host(self):
        return self.api_url

    async def connect(self):
        self.log_streamer = None

        self.log('info', f'Waiting for runtime to become ready at {self.api_url}...')
        self.send_status_message('STATUS$WAITING_FOR_CLIENT')

        await call_sync_from_async(self._wait_until_alive)

        self.log('info', 'Runtime is ready.')

        await call_sync_from_async(self.setup_initial_env)
        self.log('info', 'initial env')

        self.log(
            'debug',
            f'Container initialized with plugins: {[plugin.name for plugin in self.plugins]}. VSCode URL: {self.vscode_url}',
        )
        self.send_status_message(' ')
        self.log('info', 'status message')
        self._runtime_initialized = True
        self.log('info', 'END!')

    @tenacity.retry(
        stop=tenacity.stop_after_delay(120) | stop_if_should_exit(),
        retry=tenacity.retry_if_exception_type(
            (ConnectionError, requests.exceptions.ConnectionError)
        ),
        reraise=True,
        wait=tenacity.wait_fixed(2),
    )
    def _wait_until_alive(self):
        while True:
            try:
                self.check_if_alive()
                return
            except requests.exceptions.ConnectionError:
                pass
        
    def close(self, rm_all_containers: bool | None = None):
        """Closes the DockerRuntime and associated objects

        Parameters:
        - rm_all_containers (bool): Whether to remove all containers with the 'openhands-sandbox-' prefix
        """
        super().close()
        if self.log_streamer:
            self.log_streamer.close()

    @property
    def vscode_url(self) -> str | None:
        return None

    @property
    def web_hosts(self):
        hosts: dict[str, int] = {}

        for port in self._app_ports:
            hosts[f'http://localhost:{port}'] = port

        return hosts

    def pause(self):
        pass

    def resume(self):
        pass

    @classmethod
    async def delete(cls, conversation_id: str):
        pass
