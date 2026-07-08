<template>
  <div v-if="org" class="flex flex-col gap-8">
    <PanelHeader title="Paiement" description="Moyens de paiement et factures.">
      <template #actions>
        <DsButton label="Ajouter une carte" variant="secondary-gray" size="md" icon-leading="plus" @click="openAdd" />
      </template>
    </PanelHeader>

    <!-- Moyens de paiement -->
    <section class="flex flex-col gap-3">
      <h3 class="text-base font-semibold text-text-primary">Moyens de paiement</h3>

      <div v-if="org.paymentMethods.length" class="divide-y divide-border rounded-lg border border-border">
        <div v-for="pm in org.paymentMethods" :key="pm.id" class="flex items-center gap-4 px-4 py-3.5">
          <div class="flex h-9 w-12 shrink-0 items-center justify-center rounded-md border border-border text-xs font-semibold text-text-secondary">
            {{ pm.brand === 'visa' ? 'VISA' : 'MC' }}
          </div>
          <div class="min-w-0 flex-1">
            <p class="font-medium text-text-primary">•••• {{ pm.last4 }}</p>
            <p class="text-sm text-text-tertiary">Expire {{ String(pm.expMonth).padStart(2, '0') }}/{{ pm.expYear }}</p>
          </div>
          <DsBadge v-if="pm.isDefault" label="Par défaut" color="gray" variant="pill-color" size="sm" />
          <DsDropdown trigger="icon" :open="openId === pm.id" @update:open="(v) => (openId = v ? pm.id : null)">
            <DsDropdownItem v-if="!pm.isDefault" label="Définir par défaut" icon="clipboard-check" @click="setDefault(pm.id)" />
            <DsDropdownItem class="ds-dropdown-item--danger" label="Supprimer la carte" icon="trash-01" @click="removeCard(pm.id)" />
          </DsDropdown>
        </div>
      </div>

      <div v-else class="rounded-lg border border-dashed border-border px-4 py-8 text-center text-sm text-text-tertiary">
        Aucun moyen de paiement enregistré.
      </div>
    </section>

    <!-- Factures -->
    <section class="flex flex-col gap-3">
      <h3 class="text-base font-semibold text-text-primary">Factures</h3>

      <div v-if="org.invoices.length" class="divide-y divide-border rounded-lg border border-border">
        <div v-for="inv in org.invoices" :key="inv.id" class="flex items-center gap-4 px-4 py-3.5">
          <div class="min-w-0 flex-1">
            <p class="font-medium text-text-primary">{{ inv.numero }}</p>
            <p class="text-sm text-text-tertiary">{{ formatDate(inv.date) }}</p>
          </div>
          <p class="text-sm font-medium text-text-secondary">{{ inv.montant }}</p>
          <DsBadge :label="statusMeta(inv.status).label" :color="statusMeta(inv.status).color" variant="pill-color" size="sm" />
          <DsButton label="" variant="tertiary" size="sm" icon-leading="download-01" @click="notify('Téléchargement de la facture.')" />
        </div>
      </div>

      <div v-else class="rounded-lg border border-dashed border-border px-4 py-8 text-center text-sm text-text-tertiary">
        Aucune facture pour l'instant.
      </div>
    </section>

    <!-- Ajouter une carte -->
    <Modal v-model="addOpen" title="Ajouter une carte" description="Démo, aucune vraie transaction." size="md">
      <div class="mt-4 flex flex-col gap-4">
        <DsInputField v-model="card.numero" label="Numéro de carte" placeholder="4242 4242 4242 4242" />
        <div class="grid grid-cols-2 gap-3">
          <DsInputField v-model="card.exp" label="Expiration" placeholder="MM/AA" />
          <DsInputField v-model="card.cvc" label="CVC" placeholder="123" />
        </div>
      </div>
      <template #footer>
        <DsButton label="Annuler" variant="secondary-gray" size="md" @click="addOpen = false" />
        <DsButton label="Ajouter la carte" variant="primary" size="md" :disabled="!cardValid" @click="addCard" />
      </template>
    </Modal>
  </div>

  <div v-else class="py-12 text-center text-text-tertiary">Aucune organisation active.</div>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from 'vue'
import Modal from '~/components/ui/Modal.vue'
import { useSessionStore } from '~/stores/session'
import { useToastStore } from '~/stores/toast'
import { INVOICE_STATUS_META, type InvoiceStatus } from '~/types/organisation'

const session = useSessionStore()
const toast   = useToastStore()
session.init()

const org = computed(() => session.activeOrg)

const openId = ref<string | null>(null)

function statusMeta(s: InvoiceStatus) { return INVOICE_STATUS_META[s] }
function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })
}
function notify(title: string) { toast.show({ title, description: 'Démo.' }) }

function setDefault(id: string) { session.setDefaultPaymentMethod(id); openId.value = null; toast.show({ title: 'Carte définie par défaut.' }) }
function removeCard(id: string) { session.removePaymentMethod(id); openId.value = null; toast.show({ title: 'Carte supprimée.' }) }

// ── Ajout de carte ────────────────────────────────────────────────────────────
const addOpen = ref(false)
const card = reactive({ numero: '', exp: '', cvc: '' })
const cardValid = computed(() => card.numero.replace(/\s/g, '').length >= 12 && /^\d{2}\/\d{2}$/.test(card.exp))
function openAdd() { card.numero = ''; card.exp = ''; card.cvc = ''; addOpen.value = true }
function addCard() {
  if (!cardValid.value) return
  const digits = card.numero.replace(/\s/g, '')
  const [mm, aa] = card.exp.split('/')
  session.addPaymentMethod({
    brand:    digits.startsWith('4') ? 'visa' : 'mastercard',
    last4:    digits.slice(-4),
    expMonth: Number(mm),
    expYear:  2000 + Number(aa),
  })
  addOpen.value = false
  toast.show({ title: 'Carte ajoutée.' })
}
</script>
