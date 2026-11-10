import handler from "vinext/server/fetch-handler";
import { runWithConnectorBinding } from "../lib/connector-context";
import type { ConnectorBinding } from "../lib/connector-contract.mjs";
import { handleCMS } from "../lib/cms-server.mjs";
import { handleBlog,replaceHomeBlog } from "../lib/blog-server.mjs";
import { handleContact } from "../lib/contact-server.mjs";
import {acceptNetlifyGateway,GATEWAY_KEY} from "../lib/netlify-gateway.mjs";

import {handleMaintenance,replaceMaintenance} from "../lib/maintenance-server.mjs";

const worker = {
  async fetch(request: Request, env: Cloudflare.Env, ctx: ExecutionContext<{ CONNECTORS?: ConnectorBinding }>) {
    const gatewayRequest=await acceptNetlifyGateway(request,env[GATEWAY_KEY]);
    if(gatewayRequest instanceof Response)return gatewayRequest;
    request=gatewayRequest;
    let binding = ctx.props?.CONNECTORS;
    // Local preview emulates the same request-scoped capability. This branch and
    // the auxiliary service binding are absent from production builds.
    if (import.meta.env.DEV && !binding && env.CONNECTORS) {
      const preview = env.CONNECTORS;
      const expiresAt = Date.now() + 60_000;
      binding = {
        async getContext() {
          if (Date.now() >= expiresAt) return { status: "request_context_expired" };
          return preview.getContext?.() ?? { status: "binding_unavailable" };
        },
        async invoke(connectorId, actionName, args) {
          if (Date.now() >= expiresAt) {
            return { status: "request_context_expired", message: "This request has expired. Please try again." };
          }
          return preview.invoke(connectorId, actionName, args);
        },
      };
    }
    return runWithConnectorBinding(binding, async () => {
      const maintenance = await handleMaintenance(request,env);
      if(maintenance)return maintenance;
      const contact = await handleContact(request, env);
      if (contact) return contact;
      const blog = await handleBlog(request, env);
      if (blog) return blog;
      const cms = await handleCMS(request, env);
      if (cms) return cms;
      // Keep every existing static page and URL intact while adding the admin API.
      const path = new URL(request.url).pathname;
      const legacy = /^\/(?:motos\/(?:pulsar-n150|dominar-ns160|dominar-ns200|dominar-250|dominar-ns400z|dominar-400)|ofertas|financiamento|consorcio|test-ride|pos-venda(?:\/(?:garantia|manuais|revisoes))?|unidades|a-interiorsp|privacidade)\/?$/;
      if (env.ASSETS && ['GET','HEAD'].includes(request.method) && (path === '/' || path === '/index.html' || legacy.test(path))) {
        const url = new URL(request.url);
        url.pathname = path === '/' || path === '/index.html' ? '/index.html' : path.replace(/\/$/, '') + '/index.html';
        const asset = await env.ASSETS.fetch(new Request(url, request));
        if (asset.ok && (path === '/' || path === '/index.html')) {
          const headers = new Headers(asset.headers);
          headers.delete('Content-Length');
          headers.delete('ETag');
          headers.set('Cache-Control','no-store');
          return new Response(request.method === 'HEAD' ? null : await replaceHomeBlog(await asset.text(),env),{status:200,headers});
        }
        if(asset.ok&&/^\/pos-venda\/revisoes\/?$/.test(path)){const headers=new Headers(asset.headers);headers.delete('Content-Length');headers.delete('ETag');headers.set('Cache-Control','private, no-store');return new Response(request.method==='HEAD'?null:await replaceMaintenance(await asset.text(),env),{status:200,headers});}
        if (asset.status !== 404) return asset;
      }
      if (env.ASSETS && ['GET','HEAD'].includes(request.method)) {
        const asset = await env.ASSETS.fetch(request);
        if (asset.status !== 404) return asset;
      }
      return handler.fetch(request, env, ctx);
    });
  },
};

export default worker;
