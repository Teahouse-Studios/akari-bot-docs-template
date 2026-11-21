<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, useSlots } from "vue"

import { useOptionalAkariConfig } from "../../composables/useAkariConfig"
import { paramDocs, usageSegments, type ParamSpec, type UsageSegment } from "./facts"

interface CommandOption {
  flag: string
  desc: string
}

const props = withDefaults(
  defineProps<{
    usage: string | string[]
    permission?: string
    type?: string
    aliases?: string[]
    options?: CommandOption[]
    params?: ParamSpec
    prefix?: string
    platforms?: string | string[]
    excluded?: string | string[]
  }>(),
  {
    permission: "",
    type: "",
    aliases: () => [],
    options: () => [],
    params: () => [],
    prefix: "",
    platforms: "",
    excluded: "",
  },
)

const akari = useOptionalAkariConfig()

const usages = computed(() => (Array.isArray(props.usage) ? props.usage : [props.usage]))

// 前缀取自站点配置，站点未配置时按空串处理；正则与事件由消息内容触发，不带前缀。
const commandPrefix = computed(() => {
  if (props.type === "regex" || props.type === "event") return ""
  return props.prefix || akari?.value.commandPrefix || ""
})

const prefixedUsages = computed(() =>
  usages.value.map((line) => `${commandPrefix.value}${line}`),
)

const parsedUsages = computed(() => prefixedUsages.value.map((line) => usageSegments(line)))

const params = computed(() => paramDocs(usages.value, props.params))

const documentedParams = computed(() => params.value.filter((param) => param.description))

const paramByName = computed(() => new Map(params.value.map((param) => [param.name, param])))

const hasParams = computed(() =>
  parsedUsages.value.some((line) => line.some((segment) => segment.kind === "param")),
)

// 无参数用法是完整命令的简写，与带参数的写法并排会读成前缀关系，改为逐行排列。
const stackUsages = computed(
  () =>
    parsedUsages.value.length > 1 &&
    parsedUsages.value.some((line) => !line.some((segment) => segment.kind === "param")),
)

const hasOptional = computed(() =>
  parsedUsages.value.some((line) =>
    line.some((segment) => segment.kind === "param" && !segment.required),
  ),
)

const active = ref("")

function description(name: string): string {
  return paramByName.value.get(name)?.description ?? ""
}

function ariaLabel(segment: UsageSegment): string {
  if (segment.kind !== "param") return ""
  const detail = description(segment.name)
  const required = segment.required ? "必填" : "可选"
  return detail ? `${segment.name}：${detail}，${required}` : `${segment.name}：${required}`
}

function segmentClass(segment: UsageSegment): Record<string, boolean> {
  return {
    "command-usage__param": segment.kind === "param",
    "is-active": segment.kind === "param" && active.value === segment.name,
  };
}

const permissionLabels: Record<string, string> = {
  public: "公开",
  admin: "仅管理员",
  superuser: "仅超级用户授权使用",
  base_superuser: "仅基础超级用户",
}

const typeLabels: Record<string, string> = {
  command: "命令",
  rss: "订阅",
  regex: "正则",
  event: "事件",
  option: "设置",
}

const permissionIcons: Record<string, string> = {
  public: "public",
  admin: "shield",
  superuser: "key",
  base_superuser: "crown",
}

const typeIcons: Record<string, string> = {
  command: "terminal",
  option: "tune",
  rss: "rss_feed",
  regex: "asterisk",
  event: "bolt",
}

const platformLabels: Record<string, string> = {
  QQ: "QQ",
  QQBot: "QQBot",
  "QQ|Group": "QQ 群聊",
  "QQ|Private": "QQ 私聊",
  "QQBot|Group": "QQBot 群",
  "QQBot|Guild": "QQBot 频道",
  "Discord|Channel": "Discord 频道",
  Discord: "Discord",
  Telegram: "Telegram",
  KOOK: "KOOK",
  Matrix: "Matrix",
  Web: "Web",
  Console: "控制台",
}

function toList(value?: string | string[]): string[] {
  if (!value) return []
  return (Array.isArray(value) ? value : [value]).map((item) => item.trim()).filter(Boolean)
}

function platformText(values: string[]): string {
  return values.map((value) => platformLabels[value] || value).join(" / ")
}

const platformList = computed(() => toList(props.platforms))

const excludedList = computed(() => toList(props.excluded))

const platformTextValue = computed(() => platformText(platformList.value))

const excludedTextValue = computed(() => platformText(excludedList.value))

const hasMeta = computed(
  () =>
    Boolean(props.type || props.permission || props.aliases.length) ||
    platformList.value.length > 0 ||
    excludedList.value.length > 0,
)

const slots = useSlots()

const hasSlot = computed(() => Boolean(slots.default))

// 插槽里的示例会随交互追加消息，高度用过渡补齐，避免整块瞬间撑开。
const slotInner = ref<HTMLElement | null>(null)

const slotHeight = ref(0)

const slotReady = ref(false)

let slotObserver: ResizeObserver | undefined

function measureSlot() {
  slotHeight.value = slotInner.value?.offsetHeight ?? 0
}

onMounted(() => {
  if (!hasSlot.value) return
  measureSlot()
  requestAnimationFrame(() => {
    slotReady.value = true
  })
  if (!slotInner.value || typeof ResizeObserver === "undefined") return
  slotObserver = new ResizeObserver(measureSlot)
  slotObserver.observe(slotInner.value)
})

onBeforeUnmount(() => slotObserver?.disconnect())
</script>

<template>
  <section class="command-usage">
    <p v-if="hasMeta" class="command-usage__meta">
      <span v-if="props.type" class="meta-badge" :class="`meta-badge--${props.type}`">
        <m3e-icon class="meta-badge__icon" :name="typeIcons[props.type] || 'terminal'"></m3e-icon>
        {{ typeLabels[props.type] || props.type }}
      </span>
      <span
        v-if="props.permission"
        class="meta-badge"
        :class="`meta-badge--permission-${props.permission}`"
      >
        <m3e-icon
          class="meta-badge__icon"
          :name="permissionIcons[props.permission] || 'shield'"
        ></m3e-icon>
        {{ permissionLabels[props.permission] || props.permission }}
      </span>
      <span v-if="platformList.length" class="meta-badge meta-badge--platform">
        <m3e-icon class="meta-badge__icon" name="devices"></m3e-icon>
        仅 {{ platformTextValue }}
      </span>
      <span
        v-if="excludedList.length"
        class="meta-badge meta-badge--platform meta-badge--platform-excluded"
      >
        <m3e-icon class="meta-badge__icon" name="block"></m3e-icon>
        {{ excludedTextValue }} 不可用
      </span>
      <span v-if="props.aliases.length" class="meta-badge meta-badge--alias">
        <m3e-icon class="meta-badge__icon" name="sell"></m3e-icon>
        别名
        <code v-for="alias in props.aliases" :key="alias">{{ alias }}</code>
      </span>
    </p>
    <p class="command-usage__usage" :class="{ 'command-usage__usage--stacked': stackUsages }">
      <span class="command-usage__label">
        <m3e-icon class="command-usage__icon" name="terminal"></m3e-icon>用法：
      </span>
      <span class="command-usage__lines">
        <code v-for="(line, lineIndex) in parsedUsages" :key="lineIndex" class="command-usage__line"><span v-for="(segment, segmentIndex) in line" :key="segmentIndex" :class="segmentClass(segment)" :tabindex="segment.kind === 'param' ? 0 : undefined" :aria-label="segment.kind === 'param' ? ariaLabel(segment) : undefined" @mouseenter="segment.kind === 'param' && (active = segment.name)" @mouseleave="segment.kind === 'param' && (active = '')" @focus="segment.kind === 'param' && (active = segment.name)" @blur="segment.kind === 'param' && (active = '')">{{ segment.text }}<span v-if="segment.kind === 'param'" class="command-usage__tip" role="tooltip" aria-hidden="true"><span v-if="description(segment.name)" class="command-usage__tip-desc">{{ description(segment.name) }}</span><span class="command-usage__tip-meta">{{ segment.required ? "必填" : "可选" }}</span></span></span></code>
      </span>
    </p>
    <ul v-if="documentedParams.length" class="command-usage__params">
      <li v-for="param in documentedParams" :key="param.name">
        <code>{{ param.symbol }}</code>
        <span class="command-usage__param-desc">{{ param.description }}</span>
        <span class="command-usage__param-flag">{{ param.required ? "必填" : "可选" }}</span>
      </li>
    </ul>
    <p v-if="hasParams" class="command-usage__syntax">{{ hasOptional ? "尖括号表示必填参数，方括号表示可选参数。" : "尖括号表示必填参数。" }}</p>
    <ul v-if="props.options.length" class="command-usage__options">
      <li v-for="option in props.options" :key="option.flag">
        <code>{{ option.flag }}</code>
        {{ option.desc }}
      </li>
    </ul>
    <div
      v-if="hasSlot"
      class="command-usage__slot"
      :class="{ 'command-usage__slot--ready': slotReady }"
      :style="slotReady ? { height: `${slotHeight}px` } : undefined"
    >
      <div ref="slotInner" class="command-usage__slot-inner">
        <slot />
      </div>
    </div>
  </section>
</template>

