import { type RouteConfig, layout, route } from "@react-router/dev/routes";

export default [
  layout("routes/root-layout.tsx", [
    route("conversations/:conversationId", "routes/conversation.tsx"),
  ]),
] satisfies RouteConfig;
