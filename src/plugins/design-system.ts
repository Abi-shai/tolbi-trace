import '@abi-shai/tolbi-design-system/tokens'
import {
  Avatar,
  Badge,
  BadgeGroup,
  Breadcrumbs,
  Button,
  ButtonGroup,
  ButtonGroupItem,
  Checkbox,
  CloseButton,
  CreditsChip,
  Dropdown,
  DropdownDivider,
  DropdownItem,
  DropdownSelectItem,
  HelpIcon,
  HorizontalNavigation,
  Icon,
  InputDropdown,
  InputField,
  Logo,
  ModuleIcon,
  ModulesList,
  Pagination,
  ProgressBar,
  ProgressCircle,
  ProgressSteps,
  Scrollbar,
  Slider,
  Table,
  Tabs,
  Tag,
  TextareaInputField,
  Toggle,
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
  nuxtApp.vueApp.component('DsBreadcrumbs', Breadcrumbs)
  nuxtApp.vueApp.component('DsCheckbox', Checkbox)
  nuxtApp.vueApp.component('DsCloseButton', CloseButton)
  nuxtApp.vueApp.component('DsCreditsChip', CreditsChip)
  nuxtApp.vueApp.component('DsDropdown', Dropdown)
  nuxtApp.vueApp.component('DsDropdownDivider', DropdownDivider)
  nuxtApp.vueApp.component('DsDropdownItem', DropdownItem)
  nuxtApp.vueApp.component('DsDropdownSelectItem', DropdownSelectItem)
  nuxtApp.vueApp.component('DsHelpIcon', HelpIcon)
  nuxtApp.vueApp.component('DsHNav', HorizontalNavigation)
  nuxtApp.vueApp.component('DsIcon', Icon)
  nuxtApp.vueApp.component('DsInputDropdown', InputDropdown)
  nuxtApp.vueApp.component('DsInputField', InputField)
  nuxtApp.vueApp.component('DsLogo', Logo)
  nuxtApp.vueApp.component('DsModuleIcon', ModuleIcon)
  nuxtApp.vueApp.component('DsModulesList', ModulesList)
  nuxtApp.vueApp.component('DsPagination', Pagination)
  nuxtApp.vueApp.component('DsProgressBar', ProgressBar)
  nuxtApp.vueApp.component('DsProgressCircle', ProgressCircle)
  nuxtApp.vueApp.component('DsProgressSteps', ProgressSteps)
  nuxtApp.vueApp.component('DsScrollbar', Scrollbar)
  nuxtApp.vueApp.component('DsSlider', Slider)
  nuxtApp.vueApp.component('DsTable', Table)
  nuxtApp.vueApp.component('DsTabs', Tabs)
  nuxtApp.vueApp.component('DsTag', Tag)
  nuxtApp.vueApp.component('DsTextareaField', TextareaInputField)
  nuxtApp.vueApp.component('DsToggle', Toggle)
  nuxtApp.vueApp.component('DsTooltip', Tooltip)
  nuxtApp.vueApp.component('DsVerificationCode', VerificationCodeInputField)
})
