import { defineConfig } from "vitepress";

// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: "Cool Admin",
  description: "一个很酷的后台管理系统开发框架",
  lastUpdated: true,

  markdown: {
    toc: { level: [1, 2, 3, 4] },
  },

  themeConfig: {
    logo: "/logo.png",
    search: {
      provider: "local",
    },
    footer: {
      message: "COOL为开发者而生",
      copyright:
        '<a href="https://beian.miit.gov.cn">Copyright © COOL | 闽ICP备2024042701号</a>',
    },
    docFooter: {
      prev: "上一页",
      next: "下一页",
    },

    outline: {
      label: "页面导航",
      level: [2, 3],
    },
    lastUpdated: {
      text: "最后更新于",
      formatOptions: {
        dateStyle: "short",
        timeStyle: "medium",
      },
    },
    langMenuLabel: "多语言",
    returnToTopLabel: "回到顶部",
    sidebarMenuLabel: "菜单",
    darkModeSwitchLabel: "主题",
    lightModeSwitchTitle: "切换到浅色模式",
    darkModeSwitchTitle: "切换到深色模式",
    editLink: {
      text: "在GitHub上编辑",
      pattern:
        "https://github.com/cool-team-official/cool-admin-go-next-docs/blob/main/:path",
    },
    // https://vitepress.dev/reference/default-theme-config
    nav: [
      { text: "介绍", link: "/src/introduce/index.md", noIcon: false },
      { text: "教程", link: "/src/guide/quick.md" },
      { text: "🔥插件市场", link: "https://cool-js.com/plugin" },
      { text: "交流合作", link: "/src/about/index.md" },
      {
        text: "v7.1.2",
        items: [
          {
            text: "更新日志",
            link: "/src/todo/update.md",
          },
          {
            text: "版本计划",
            link: "/src/todo/plan.md",
          },
        ],
      },
      {
        text: "更多",
        items: [
          {
            text: "Cool官网",
            link: "https://cool-js.com",
          },
          {
            text: "Cool Admin(Java版)",
            link: "https://java.cool-admin.com",
          },
          {
            text: "Cool Admin Vue(前端)",
            link: "https://vue.cool-admin.com",
          },
          {
            text: "Uni（基于uni-app跨端移动端开发）",
            link: "https://uni-docs.cool-js.com",
          },
        ],
      },
    ],
    sidebar: [
      {
        text: "介绍",
        items: [
          {
            text: "简介",
            link: "/src/introduce/index.md",
          },
          {
            text: "演示",
            link: "/src/introduce/show.md",
          },
          {
            text: "源码",
            link: "/src/introduce/src.md",
          },
        ],
      },
      {
        text: "教程",
        items: [
          { text: "快速开始", link: "/src/guide/quick.md" },
          { text: "Ai编码", link: "/src/guide/ai.md" },
          { text: "Ai流程编排", link: "/src/guide/flow.md" },
          { text: "扩展插件", link: "/src/guide/plugin.md" },
          { text: "视频教程", link: "/src/guide/course.md" },
          { text: "服务部署", link: "/src/guide/deploy.md" },
          {
            text: "核心",
            items: [
              {
                text: "控制器(controller)",
                link: "/src/guide/core/controller.md",
              },
              {
                text: "服务(service)",
                link: "/src/guide/core/service.md",
              },
              {
                text: "数据库(db)",
                link: "/src/guide/core/db.md",
              },
              {
                text: "模块开发(module)",
                link: "/src/guide/core/module.md",
              },
              { text: "权限管理(auth)", link: "/src/guide/core/authority.md" },
              { text: "服务扫描(eps)", link: "/src/guide/core/eps.md" },
              { text: "缓存(cache)", link: "/src/guide/core/cache.md" },
              { text: "文件上传(upload)", link: "/src/guide/core/file.md" },
              {
                text: "异常处理(exception)",
                link: "/src/guide/core/exception.md",
              },
              { text: "任务与队列(task)", link: "/src/guide/core/task.md" },
              {
                text: "大数据(elasticsearch)",
                link: "/src/guide/core/es.md",
              },
              {
                text: "支付(pay)",
                link: "/src/guide/core/pay.md",
              },
              {
                text: "即时通讯(socket)",
                link: "/src/guide/core/socket.md",
              },
              {
                text: "事件(event)",
                link: "/src/guide/core/event.md",
              },
              {
                text: "微服务(rpc)",
                link: "/src/guide/core/rpc.md",
              },
            ],
          },
          {
            text: "其它",
            items: [
              {
                text: "Excel导入导出",
                link: "/src/guide/other/excel.md",
              },
              {
                text: "SSE调用",
                link: "/src/guide/other/sse.md",
              },
              {
                text: "Redis集群",
                link: "/src/guide/other/redis.md",
              },
              {
                text: "混淆打包",
                link: "/src/guide/other/obfuscate.md",
              },
            ],
          },
        ],
      },
      {
        text: "计划&更新",
        items: [
          {
            text: "更新",
            link: "/src/todo/update.md",
          },
          {
            text: "计划",
            link: "/src/todo/plan.md",
          },
        ],
      },
      {
        text: "交流合作",
        link: "/src/about/index.md",
      },
    ],
    socialLinks: [
      {
        icon: "github",
        link: "https://github.com/cool-team-official/cool-admin-midway",
      },
    ],
  },
});
