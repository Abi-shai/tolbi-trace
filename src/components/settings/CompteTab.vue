<template>
  <div class="flex max-w-5xl flex-col gap-8">
    <PanelHeader title="Compte" description="Gère ton compte et tes informations personnelles.">
      <template #actions>
        <DsButton
          label="Supprimer le compte"
          variant="danger"
          size="md"
          icon-leading="trash-01"
          @click="deleteOpen = true"
        />
      </template>
    </PanelHeader>

    <!-- Photo de profil -->
    <section class="flex flex-col gap-4">
      <h3 class="text-base font-semibold text-text-primary">Photo de profil</h3>
      <div class="flex items-center gap-5">
        <DsAvatar size="2xl" :src="user?.avatarSrc" :initials="session.userInitials" :alt="session.userFullName" />
        <div class="flex items-center gap-3">
          <DsButton label="Changer la photo" variant="secondary-gray" size="md" icon-leading="image-03" @click="pickPhoto" />
          <DsButton v-if="user?.avatarSrc" label="Supprimer la photo" variant="danger-secondary" size="md" @click="session.updateAccount({ avatarSrc: undefined })" />
        </div>
        <input ref="fileInput" type="file" accept="image/*" class="hidden" @change="onPhoto" />
      </div>
    </section>

    <!-- Informations -->
    <section class="grid grid-cols-1 gap-x-8 gap-y-6 md:grid-cols-2">
      <EditableField label="Prénom et nom" :model-value="session.userFullName" @save="saveName" />

      <!-- Email : non modifiable -->
      <div class="flex flex-col gap-1.5">
        <label class="text-sm font-medium text-text-secondary">Adresse email</label>
        <DsInputField :model-value="user?.email ?? ''" disabled />
      </div>

      <!-- Mot de passe -->
      <div class="flex flex-col gap-1.5">
        <label class="text-sm font-medium text-text-secondary">Mot de passe</label>
        <div v-if="!pwdEditing" class="flex items-start gap-2">
          <DsInputField class="flex-1" model-value="••••••••••••" type="password" disabled />
          <DsButton label="Modifier" variant="secondary-gray" size="md" icon-leading="edit-01" @click="pwdEditing = true" />
        </div>
        <div v-else class="flex flex-col gap-2">
          <DsInputField v-model="pwd.next" type="password" placeholder="Nouveau mot de passe" />
          <DsInputField
            v-model="pwd.confirm"
            type="password"
            placeholder="Confirme le mot de passe"
            :destructive="pwdMismatch"
            :hint="pwdMismatch ? 'Les mots de passe ne correspondent pas.' : ''"
          />
          <div class="flex items-center gap-2">
            <DsButton label="Enregistrer" variant="primary" size="md" :disabled="!pwdValid" @click="savePwd" />
            <DsButton label="Annuler" variant="secondary-gray" size="md" @click="cancelPwd" />
          </div>
        </div>
      </div>

      <EditableField
        label="Numéro de téléphone"
        type="tel"
        :model-value="user?.telephone ?? ''"
        @save="(v) => session.updateAccount({ telephone: v })"
      />
    </section>

    <!-- Préférence de langue -->
    <section class="flex flex-col gap-1.5 max-w-xs border-t border-border pt-6">
      <label class="text-sm font-medium text-text-secondary">Préférence de langue</label>
      <DsInputDropdown
        :model-value="user?.langue"
        :options="langueOptions"
        leading-icon="globe-slated-01"
        @update:model-value="session.setLangue($event)"
      />
    </section>

    <!-- Confirmation de suppression -->
    <ConfirmDialog
      v-model="deleteOpen"
      title="Supprimer le compte"
      :description="deleteDescription"
      :confirm-label="soleOwnerCount > 0 ? 'Supprimer quand même' : 'Supprimer le compte'"
      @confirm="onDelete"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from 'vue'
import { useSessionStore } from '~/stores/session'
import { useToastStore } from '~/stores/toast'
import { LANGUES } from '~/types/user'

const session = useSessionStore()
const toast   = useToastStore()
session.init()

const user = computed(() => session.user)
const langueOptions = LANGUES

// ── Photo ─────────────────────────────────────────────────────────────────────
const fileInput = ref<HTMLInputElement | null>(null)
function pickPhoto() { fileInput.value?.click() }
function onPhoto(e: Event) {
  const file = (e.target as HTMLInputElement).files?.[0]
  if (!file) return
  const reader = new FileReader()
  reader.onload = () => session.updateAccount({ avatarSrc: String(reader.result) })
  reader.readAsDataURL(file)
}

// ── Nom ───────────────────────────────────────────────────────────────────────
function saveName(full: string) {
  const parts = full.trim().split(/\s+/)
  const nom = parts.length > 1 ? parts.pop()! : ''
  session.updateAccount({ prenom: parts.join(' '), nom })
  toast.show({ title: 'Nom mis à jour.' })
}

// ── Mot de passe ──────────────────────────────────────────────────────────────
const pwdEditing = ref(false)
const pwd = reactive({ next: '', confirm: '' })
const pwdMismatch = computed(() => pwd.confirm.length > 0 && pwd.next !== pwd.confirm)
const pwdValid    = computed(() => pwd.next.length >= 8 && pwd.next === pwd.confirm)
function cancelPwd() { pwd.next = ''; pwd.confirm = ''; pwdEditing.value = false }
function savePwd() {
  if (!pwdValid.value) return
  cancelPwd()
  toast.show({ title: 'Mot de passe mis à jour.' })
}

// ── Suppression du compte ─────────────────────────────────────────────────────
const deleteOpen = ref(false)
// Garde : User Propriétaire d'une org (rôle unique par org, ADR-0014) → la
// suppression du compte l'emporterait avec.
const soleOwnerCount = computed(() =>
  session.organisations.filter(
    (o) => o.membres.some((m) => m.isCurrentUser && m.roleId === 'proprietaire'),
  ).length,
)
const deleteDescription = computed(() =>
  soleOwnerCount.value > 0
    ? `Tu es le seul Propriétaire de ${soleOwnerCount.value} organisation${soleOwnerCount.value > 1 ? 's' : ''}. Transfère la propriété avant de continuer, sinon elle${soleOwnerCount.value > 1 ? 's' : ''} sera supprimée${soleOwnerCount.value > 1 ? 's' : ''} aussi. Action irréversible.`
    : 'Cette action est irréversible. Toutes tes données personnelles seront effacées.',
)
function onDelete() {
  toast.show({ title: 'Compte supprimé.', description: 'Démo, aucune donnée réelle effacée.' })
}
</script>
