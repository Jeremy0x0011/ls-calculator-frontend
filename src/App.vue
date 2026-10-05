<template>
  <main class="page-shell">
    <header class="topbar">
      <a class="brand" href="#" aria-label="Clear Calculator home">
        <span class="brand-mark" aria-hidden="true">c</span>
        <span>clear<span class="brand-light">/calc</span></span>
      </a>
      <span class="architecture-note"><span class="status-dot"></span> Backend-powered calculator</span>
    </header>

    <section class="workspace" aria-label="Calculator and calculation history">
      <div class="calculator-card">
        <div class="section-heading">
          <div>
            <p class="eyebrow">YOUR WORKSPACE</p>
            <h1>Lin Shen Calculator</h1>
          </div>
          <span class="secure-tag"><span aria-hidden="true">⌁</span> Server calculated</span>
        </div>

        <form class="calculator-form" @submit.prevent="calculate">
          <div class="display" :class="{ 'display-error': errorMessage }">
            <label class="display-label" for="expression">EXPRESSION</label>
            <input
              id="expression"
              ref="expressionInput"
              v-model="expression"
              class="expression-input"
              autocomplete="off"
              inputmode="decimal"
              maxlength="256"
              placeholder="Try (12 + 8) / 2"
              aria-describedby="display-feedback"
              @keydown.enter.prevent="calculate"
            />
            <div id="display-feedback" class="display-footer" aria-live="polite">
              <span v-if="errorMessage" class="feedback-error">{{ errorMessage }}</span>
              <span v-else-if="result !== null" class="result-line">
                <span class="result-label">RESULT</span>
                <strong>{{ result }}</strong>
              </span>
              <span v-else class="display-hint">Your result will appear here</span>
            </div>
          </div>

          <div class="keypad" aria-label="Calculator keypad">
            <button class="key key-muted" type="button" @click="clearExpression">AC</button>
            <button class="key key-muted" type="button" aria-label="Delete last character" @click="removeLast">⌫</button>
            <button class="key key-muted" type="button" @click="append('(')">(</button>
            <button class="key key-operator" type="button" @click="append(')')">)</button>

            <button class="key" type="button" @click="append('7')">7</button>
            <button class="key" type="button" @click="append('8')">8</button>
            <button class="key" type="button" @click="append('9')">9</button>
            <button class="key key-operator" type="button" aria-label="Divide" @click="append('/')">÷</button>

            <button class="key" type="button" @click="append('4')">4</button>
            <button class="key" type="button" @click="append('5')">5</button>
            <button class="key" type="button" @click="append('6')">6</button>
            <button class="key key-operator" type="button" aria-label="Multiply" @click="append('*')">×</button>

            <button class="key" type="button" @click="append('1')">1</button>
            <button class="key" type="button" @click="append('2')">2</button>
            <button class="key" type="button" @click="append('3')">3</button>
            <button class="key key-operator" type="button" @click="append('-')">−</button>

            <button class="key key-muted" type="button" @click="append('±')">±</button>
            <button class="key" type="button" @click="append('0')">0</button>
            <button class="key" type="button" @click="append('.')">.</button>
            <button class="key key-operator" type="button" @click="append('+')">+</button>

            <button class="key key-equals" type="submit" :disabled="calculating">
              {{ calculating ? 'Calculating…' : 'Calculate' }}
              <span aria-hidden="true">↗</span>
            </button>
          </div>
        </form>

        <p class="keyboard-hint">Tip: type an expression and press <kbd>Enter</kbd> to calculate.</p>
      </div>

      <aside class="history-card" aria-labelledby="history-title">
        <div class="section-heading history-heading">
          <div>
            <p class="eyebrow">SAVED ON THE SERVER</p>
            <h2 id="history-title">History <span class="history-count">{{ history.length }}</span></h2>
          </div>
          <button class="refresh-button" type="button" :disabled="loadingHistory" aria-label="Refresh history" @click="loadHistory">
            <span :class="{ spinning: loadingHistory }" aria-hidden="true">↻</span>
          </button>
        </div>

        <p v-if="historyError" class="history-state history-error" role="alert">
          {{ historyError }}
        </p>
        <p v-else-if="loadingHistory && history.length === 0" class="history-state">
          Loading saved calculations…
        </p>
        <p v-else-if="history.length === 0" class="history-state">
          No calculations yet.<br />Your successful calculations will show up here.
        </p>
        <ul v-else class="history-list">
          <li v-for="item in history" :key="item.id" class="history-item">
            <div class="history-entry">
              <span class="history-expression">{{ item.expression }}</span>
              <span class="history-result">= {{ item.result }}</span>
              <time class="history-time" :datetime="item.createdAt">{{ formatDate(item.createdAt) }}</time>
            </div>
            <button
              class="delete-button"
              type="button"
              :aria-label="`Delete calculation ${item.expression} = ${item.result}`"
              :disabled="deletingId === item.id"
              @click="removeHistory(item.id)"
            >
              {{ deletingId === item.id ? '…' : '×' }}
            </button>
          </li>
        </ul>
        <p v-if="historyNotice" class="history-notice" role="status">{{ historyNotice }}</p>
        <div class="history-footer"><span class="status-dot"></span> History persists in the backend database</div>
      </aside>
    </section>

    <footer class="page-footer">
      <span>Front-end and back-end separation assignment</span>
      <span>Calculation runs on the server, not in your browser.</span>
    </footer>
  </main>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import { calculateExpression, deleteHistory, fetchHistory } from './api'

const expression = ref('')
const result = ref(null)
const history = ref([])
const calculating = ref(false)
const loadingHistory = ref(false)
const deletingId = ref(null)
const errorMessage = ref('')
const historyError = ref('')
const historyNotice = ref('')
const expressionInput = ref(null)

function append(value) {
  if (value === '±') {
    const current = expression.value.trim()
    if (!current) {
      expression.value = '-'
    } else if (current.startsWith('-(') && current.endsWith(')')) {
      expression.value = current.slice(2, -1)
    } else {
      expression.value = `-(${current})`
    }
  } else {
    expression.value += value
  }
  result.value = null
  errorMessage.value = ''
  expressionInput.value?.focus()
}

function clearExpression() {
  expression.value = ''
  result.value = null
  errorMessage.value = ''
  expressionInput.value?.focus()
}

function removeLast() {
  expression.value = expression.value.slice(0, -1)
  result.value = null
  errorMessage.value = ''
  expressionInput.value?.focus()
}

async function calculate() {
  if (calculating.value) return
  calculating.value = true
  errorMessage.value = ''
  result.value = null

  try {
    const response = await calculateExpression(expression.value)
    result.value = response.result
    await loadHistory()
  } catch (error) {
    errorMessage.value = error.message || 'Calculation request failed.'
  } finally {
    calculating.value = false
  }
}

async function loadHistory() {
  loadingHistory.value = true
  historyError.value = ''
  try {
    history.value = await fetchHistory()
  } catch (error) {
    historyError.value = error.message || 'Could not load calculation history.'
  } finally {
    loadingHistory.value = false
  }
}

async function removeHistory(id) {
  if (deletingId.value !== null) return
  deletingId.value = id
  historyNotice.value = ''
  try {
    await deleteHistory(id)
    await loadHistory()
    historyNotice.value = 'Calculation deleted from saved history.'
  } catch (error) {
    historyNotice.value = error.message || 'Could not delete this calculation.'
  } finally {
    deletingId.value = null
  }
}

function formatDate(value) {
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short'
  }).format(new Date(value))
}

onMounted(loadHistory)
</script>
