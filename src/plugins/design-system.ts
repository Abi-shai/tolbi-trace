import '@abi-shai/tolbi-design-system/tokens'
import '@abi-shai/tolbi-design-system/dist/index.css'
import {
  Avatar,
  Badge,
  BadgeGroup,
  Button,
  ButtonGroup,
  ButtonGroupItem,
  CloseButton,
  CreditsChip,
  HelpIcon,
  HorizontalNavigation,
  Icon,
  InputField,
  Logo,
  ModuleIcon,
  ModulesList,
  TextareaInputField,
  Tooltip,
  VerificationCodeInputField,
} from '@abi-shai/tolbi-design-system'

export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.vueApp.component('DsAvatar', Avatar)
  nuxtApp.vueApp.component('DsButton', Button)
  nuxtApp.vueApp.component('DsButtonGroup', ButtonGroup)
  nuxtApp.vueApp.component('DsButtonGroupItem', ButtonGroupItem)
  nuxtApp.vueApp.component('DsBadge', Badge)
  nuxtApp.vueApp.component('DsBadgeGroup', BadgeGroup)
  nuxtApp.vueApp.component('DsCloseButton', CloseButton)
  nuxtApp.vueApp.component('DsCreditsChip', CreditsChip)
  nuxtApp.vueApp.component('DsHelpIcon', HelpIcon)
  nuxtApp.vueApp.component('DsHNav', HorizontalNavigation)
  nuxtApp.vueApp.component('DsIcon', Icon)
  nuxtApp.vueApp.component('DsInputField', InputField)
  nuxtApp.vueApp.component('DsLogo', Logo)
  nuxtApp.vueApp.component('DsModuleIcon', ModuleIcon)
  nuxtApp.vueApp.component('DsModulesList', ModulesList)
  nuxtApp.vueApp.component('DsTextareaField', TextareaInputField)
  nuxtApp.vueApp.component('DsTooltip', Tooltip)
  nuxtApp.vueApp.component('DsVerificationCode', VerificationCodeInputField)
})
