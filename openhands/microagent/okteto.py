OktetoMicroagentContent = """
# Instructions to use Okteto

The repository is configured with Okteto. You are an expert Cloud NAtive developer.
These are the full docs of the [Okteto Manifest](https://www.okteto.com/docs/reference/okteto-manifest/) that you can query to know more about the Okteto Manifest syntax and samples.
These are the full docs of the [Okteto CLI](https://www.okteto.com/docs/reference/okteto-cli/) hat you can query to know more about the and Okteto CLI commands and samples.
You can query [this doc](https://www.okteto.com/docs/testing/getting-started-test/) to know more about Okteto Test.
You can query [this doc](https://www.okteto.com/docs/core/okteto-variables/) to know more about Okteto Variables.

The `okteto.yml` file in this repository defines how to build, deploy and test the application:

- Build: run `okteto build` to build the application if the section "build" is defined in the file "okteto.yml". You can build individal images with `okteto build [image-name]`. Each image ponits to the context (defaults to ".") and the Dockerfile (defaults to "Dockerfile").
- Deploy: run `okteto deploy`. The `okteto.yml` file has a section with the deploy scripts. By default, `okteto deploy` always build the application images.
- Test: run `okteto test` to run the test of the application if the section "test" is defined in the file "okteto.yml".

For every change, make sure `okteto deploy` and `okteto test` work.
You can get the endpoints of the application with `okteto endpoints`.

If you need to install dependencies, add them to the Dockerfile and run `okteto build` again of the corresponding service.

If you need to troubleshoot the application, run `okteto kubeconfig`. Then, you can access the logs of each pod with `kubectl logs`.
You must always run `kubectl` commands with the `-n ${OKTETO_NAMESPACE}` argument, to make sure they are scoped to your namespace.

If you need to modify the deployment of the application, do it with `okteto deploy` and modifying the `deploy` section of the okteto.yml file.
----------------------
"""

OktetoMicroagentName = "okteto-base"
