import { useEffect, useMemo, useState } from 'react'

type Step = 0 | 1 | 2 | 3 | 4 | 5
type Option = { value: string; label: string; caption?: string }

type MortgageEntryContext = {
  source: 'calculator' | 'listing'
  profile: { fullName: string; email: string; phone: string }
  isFamilyMortgage: boolean
  isNewBuild: boolean
  marketingConsentAlreadyGiven: boolean
}

type FormState = {
  fullName: string
  email: string
  purchaseTiming: string
  objectStatus: string
  consultantHelp: string
  incomeRange: string
  customIncome: string
  hasLoans: string
  loanPayment: string
  callSlot: string
  marketingConsent: boolean
}

type MetricParameters = Record<string, string | number | boolean>

// Замените 0 на идентификатор реального счётчика при подключении Метрики.
const METRIKA_COUNTER_ID = 0

function trackMetric(goal: string, parameters: MetricParameters) {
  console.info('[Metrika stub]', { counterId: METRIKA_COUNTER_ID, goal, parameters })
}

const entryContext: MortgageEntryContext = {
  source: 'calculator',
  profile: {
    fullName: 'Елена Воронцова',
    email: 'elena@example.com',
    phone: '+7 999 123-45-67',
  },
  isFamilyMortgage: true,
  isNewBuild: true,
  marketingConsentAlreadyGiven: false,
}

const purchaseTiming: Option[] = [
  { value: 'month', label: 'В течение месяца' },
  { value: '1-3', label: 'Через 1–3 месяца' },
  { value: '3-6', label: 'Через 3–6 месяцев' },
  { value: 'exploring', label: 'Пока изучаю' },
]

const objectStatuses: Option[] = [
  { value: 'chosen', label: 'Да, уже нашёл(а)' },
  { value: 'choosing', label: 'Нет, пока выбираю' },
  { value: 'budget', label: 'Хочу понять доступный бюджет' },
]

const incomeRanges: Option[] = [
  { value: 'under100', label: 'До 100 000 ₽' },
  { value: '100-200', label: '100–200 тыс. ₽' },
  { value: '200-300', label: '200–300 тыс. ₽' },
  { value: 'over300', label: 'Больше 300 тыс. ₽' },
  { value: 'custom', label: 'Укажу сам(а)' },
]

function getCallDays() {
  return Array.from({ length: 3 }, (_, index) => {
    const date = new Date()
    date.setDate(date.getDate() + index)
    return {
      id: date.toISOString().slice(0, 10),
      day: new Intl.DateTimeFormat('ru-RU', { weekday: 'short' }).format(date),
      date: new Intl.DateTimeFormat('ru-RU', { day: 'numeric', month: 'short' }).format(date),
    }
  })
}

function formatMoney(value: string) {
  const digits = value.replace(/\D/g, '')
  return digits ? `${new Intl.NumberFormat('ru-RU').format(Number(digits))} ₽` : ''
}

function ChoiceGroup({ value, options, onChange, ariaLabel }: { value: string; options: Option[]; onChange: (value: string) => void; ariaLabel: string }) {
  return (
    <div className="choice-group" role="radiogroup" aria-label={ariaLabel}>
      {options.map((option) => (
        <button
          className={`choice ${value === option.value ? 'choice--selected' : ''}`}
          type="button"
          role="radio"
          aria-checked={value === option.value}
          key={option.value}
          onClick={() => onChange(option.value)}
        >
          <span>{option.label}</span>
          {option.caption && <small>{option.caption}</small>}
        </button>
      ))}
    </div>
  )
}

const mapScreens = [
  { step: '0', title: 'Вход из калькулятора', copy: 'Короткая анкета вместо полной банковской формы', event: 'mortgage_form_open' },
  { step: '1', title: 'Контакты', copy: 'ФИО, почта и телефон из профиля', event: 'mortgage_form_step_view' },
  { step: '2', title: 'О покупке', copy: 'Срок, объект и условная помощь с подбором', event: 'mortgage_form_step_view' },
  { step: '3', title: 'Финансы', copy: 'Доход и действующие кредиты', event: 'mortgage_form_step_view' },
  { step: '4', title: 'Звонок эксперта', copy: 'Дата, время и согласия', event: 'mortgage_form_step_view' },
  { step: '5', title: 'Успех', copy: 'Подтверждение звонка в выбранный слот', event: 'mortgage_form_submitted' },
]

function ScenarioMap() {
  return (
    <main className="map-page">
      <header className="map-header">
        <div>
          <a className="map-back" href="/">← К анкете</a>
          <span className="eyebrow">Карта сценария</span>
          <h1>Короткая ипотечная анкета</h1>
          <p>Путь от ипотечного калькулятора до звонка эксперта. Подписи на карточках и переходах — цели Яндекс Метрики.</p>
        </div>
        <span className="metric-stub">Счётчик: {METRIKA_COUNTER_ID || 'заглушка'}</span>
      </header>

      <section className="map-flow" aria-label="Карта экранов анкеты">
        {mapScreens.map((screen, index) => (
          <div className="map-sequence" key={screen.step}>
            <article className="map-screen">
              <div className="map-phone-bar"><span>9:41</span><span>●●●</span></div>
              <span className="map-step">Экран {screen.step}</span>
              <h2>{screen.title}</h2>
              <p>{screen.copy}</p>
              <code>{screen.event} · step={screen.step}</code>
              {index > 0 && index < 5 && <small>Ошибки полей → <code>mortgage_form_validation_error · step={screen.step}</code></small>}
            </article>
            {index < mapScreens.length - 1 && (
              <div className="map-arrow" aria-label={`Переход к экрану ${Number(screen.step) + 1}`}>
                <span>{index === 0 ? 'mortgage_form_start · step=0' : `mortgage_form_step_continue · step=${screen.step}`}</span>
                <i>→</i>
              </div>
            )}
          </div>
        ))}
      </section>

      <section className="ab-section" aria-labelledby="ab-title">
        <div className="section-kicker">Эксперимент</div>
        <h2 id="ab-title">A/B-тест: короткая анкета против полной</h2>
        <div className="ab-grid">
          <article><span>Гипотеза</span><p>Короткая анкета снизит барьер входа и увеличит долю отправленных заявок без ухудшения качества лидов.</p></article>
          <article><span>Вариант A</span><p>Текущий путь: переход в полную банковскую анкету с паспортными данными и работодателем.</p></article>
          <article><span>Вариант B</span><p>Новая короткая анкета из четырёх шагов; остальные данные эксперт собирает во время звонка.</p></article>
          <article><span>Основная метрика</span><p><code>mortgage_form_submitted / mortgage_form_open</code> — конверсия из открытия формы в отправку.</p></article>
          <article><span>Ограничивающая метрика</span><p>Доля заявок, с которыми эксперт успешно связался в течение 24 часов; падение не более 3 п.п.</p></article>
          <article><span>Объём и срок</span><p>Не менее 5 000 уникальных пользователей на вариант (10 000 всего), две полные недели или до достижения выборки — что наступит позже.</p></article>
        </div>
        <p className="ab-note">Во все цели передаём <code>step</code>, <code>screen</code>, <code>source</code> и <code>ab_variant</code>, чтобы сравнить воронку и причины выхода.</p>
      </section>
    </main>
  )
}

function App() {
  if (window.location.pathname === '/map') return <ScenarioMap />

  const standardScenario = new URLSearchParams(window.location.search).get('scenario') === 'standard'
  const abVariant = new URLSearchParams(window.location.search).get('ab') ?? 'B'
  const activeContext = standardScenario
    ? { ...entryContext, isFamilyMortgage: false, isNewBuild: false }
    : entryContext
  const [step, setStep] = useState<Step>(0)
  const [errors, setErrors] = useState<string[]>([])
  const [selectedDay, setSelectedDay] = useState('')
  const [form, setForm] = useState<FormState>({
    fullName: activeContext.profile.fullName,
    email: activeContext.profile.email,
    purchaseTiming: '',
    objectStatus: '',
    consultantHelp: '',
    incomeRange: '',
    customIncome: '',
    hasLoans: '',
    loanPayment: '',
    callSlot: '',
    marketingConsent: false,
  })

  const callDays = useMemo(getCallDays, [])
  const showConsultantQuestion = activeContext.isFamilyMortgage || activeContext.isNewBuild
  const update = <K extends keyof FormState>(key: K, value: FormState[K]) => setForm((current) => ({ ...current, [key]: value }))

  useEffect(() => {
    trackMetric('mortgage_form_open', { step: 0, screen: 'entry', source: activeContext.source, ab_variant: abVariant })
  }, [abVariant, activeContext.source])

  useEffect(() => {
    if (step > 0 && step < 5) {
      trackMetric('mortgage_form_step_view', { step, screen: `step_${step}`, source: activeContext.source, ab_variant: abVariant })
    }
  }, [step, abVariant, activeContext.source])

  const validate = () => {
    const nextErrors: string[] = []
    if (step === 1) {
      if (!form.fullName.trim()) nextErrors.push('Укажите ФИО')
      if (!/^\S+@\S+\.\S+$/.test(form.email)) nextErrors.push('Введите корректную почту')
      if (!activeContext.profile.phone) nextErrors.push('Добавьте телефон в профиле Циана')
    }
    if (step === 2) {
      if (!form.purchaseTiming) nextErrors.push('Выберите срок покупки')
      if (!form.objectStatus) nextErrors.push('Расскажите, есть ли объект')
      if (showConsultantQuestion && !form.consultantHelp) nextErrors.push('Выберите, нужна ли помощь с подбором')
    }
    if (step === 3) {
      if (!form.incomeRange) nextErrors.push('Укажите доход')
      if (form.incomeRange === 'custom' && !form.customIncome.replace(/\D/g, '')) nextErrors.push('Введите ежемесячный доход')
      if (!form.hasLoans) nextErrors.push('Укажите, есть ли действующие кредиты')
      if (form.hasLoans === 'yes' && !form.loanPayment.replace(/\D/g, '')) nextErrors.push('Введите ежемесячный платёж по кредитам')
    }
    if (step === 4 && !form.callSlot) nextErrors.push('Выберите удобное время для звонка')
    setErrors(nextErrors)
    if (nextErrors.length) {
      trackMetric('mortgage_form_validation_error', { step, screen: `step_${step}`, source: activeContext.source, ab_variant: abVariant, field: nextErrors[0] })
    }
    return nextErrors.length === 0
  }

  const continueForm = () => {
    if (!validate()) return
    setErrors([])
    trackMetric(step === 4 ? 'mortgage_form_submitted' : 'mortgage_form_step_continue', { step, screen: `step_${step}`, source: activeContext.source, ab_variant: abVariant })
    setStep((current) => (current === 4 ? 5 : ((current + 1) as Step)))
  }

  const goBack = () => {
    setErrors([])
    setStep((current) => (current > 1 ? ((current - 1) as Step) : 0))
  }

  const selectedSlotLabel = form.callSlot ? form.callSlot.replace('|', ', ') : ''

  if (step === 0) {
    return (
      <main className="app-shell entry-screen">
        <div className="status-bar" aria-hidden="true"><span>9:41</span><span>●●● ◔</span></div>
        <section className="entry-hero">
          <div className="home-mark">⌂</div>
          <span className="eyebrow">Ипотека</span>
          <h1>Начнём с короткой анкеты</h1>
          <p>Ответьте на несколько вопросов — эксперт поможет подобрать ипотеку и сам уточнит остальное.</p>
        </section>
        <section className="info-card" aria-label="Что уже известно">
          <span className="info-icon">✓</span>
          <div><strong>Расчёт сохранён</strong><p>Продолжим с параметрами из калькулятора.</p></div>
        </section>
        <div className="entry-spacer" />
        <div className="bottom-action">
          <button className="primary-button" onClick={() => { trackMetric('mortgage_form_start', { step: 0, screen: 'entry', source: activeContext.source, ab_variant: abVariant }); setStep(1) }}>Продолжить</button>
          <p>Займёт около 2 минут</p>
        </div>
      </main>
    )
  }

  if (step === 5) {
    return (
      <main className="app-shell success-screen">
        <div className="status-bar" aria-hidden="true"><span>9:41</span><span>●●● ◔</span></div>
        <div className="success-mark">✓</div>
        <span className="eyebrow">Заявка принята</span>
        <h1>Эксперт свяжется с вами</h1>
        <p className="lead">Позвоним {selectedSlotLabel}. Эксперт партнёра уточнит детали и поможет подготовить заявку в банк.</p>
        <div className="next-card">
          <strong>Что будет дальше</strong>
          <ol><li>Позвоним в выбранное время</li><li>Уточним условия и документы</li><li>Поможем выбрать подходящие предложения</li></ol>
        </div>
        <button className="secondary-button" onClick={() => { setStep(0); setErrors([]) }}>Вернуться к расчёту</button>
      </main>
    )
  }

  return (
    <main className="app-shell">
      <div className="status-bar" aria-hidden="true"><span>9:41</span><span>●●● ◔</span></div>
      <header className="form-header">
        <button className="back-button" type="button" onClick={goBack} aria-label="Назад">‹</button>
        <div className="progress-copy"><span>Шаг {step} из 4</span><div className="progress-track"><i style={{ width: `${step * 25}%` }} /></div></div>
        <button className="close-button" type="button" onClick={() => { trackMetric('mortgage_form_close', { step, screen: `step_${step}`, source: activeContext.source, ab_variant: abVariant }); setStep(0) }} aria-label="Закрыть">×</button>
      </header>

      <section className="form-content">
        {step === 1 && <>
          <span className="eyebrow">Контакты</span>
          <h1>Как с вами связаться?</h1>
          <p className="lead">Проверим контакты из профиля — их можно изменить, кроме телефона.</p>
          <label className="field-label" htmlFor="fullName">ФИО</label>
          <input id="fullName" className="text-field" value={form.fullName} onChange={(event) => update('fullName', event.target.value)} placeholder="Например, Анна Петрова" autoComplete="name" />
          <label className="field-label" htmlFor="email">Почта</label>
          <input id="email" className="text-field" value={form.email} onChange={(event) => update('email', event.target.value)} placeholder="name@example.com" type="email" autoComplete="email" />
          <label className="field-label" htmlFor="phone">Телефон</label>
          <div className="phone-field" id="phone"><span>{activeContext.profile.phone || 'Телефон не указан'}</span><small>Из профиля Циана</small></div>
        </>}

        {step === 2 && <>
          <span className="eyebrow">О покупке</span>
          <h1>Когда планируете покупку?</h1>
          <ChoiceGroup value={form.purchaseTiming} options={purchaseTiming} onChange={(value) => update('purchaseTiming', value)} ariaLabel="Срок покупки" />
          <h2>Есть объект для покупки?</h2>
          <ChoiceGroup value={form.objectStatus} options={objectStatuses} onChange={(value) => update('objectStatus', value)} ariaLabel="Наличие объекта" />
          {showConsultantQuestion && <>
            <h2>Помочь с подбором объекта?</h2>
            <p className="helper">Подберём варианты для семейной ипотеки и новостроек.</p>
            <ChoiceGroup value={form.consultantHelp} options={[{ value: 'yes', label: 'Да, нужна помощь' }, { value: 'no', label: 'Нет, справлюсь сам(а)' }]} onChange={(value) => update('consultantHelp', value)} ariaLabel="Помощь с подбором" />
          </>}
        </>}

        {step === 3 && <>
          <span className="eyebrow">Финансы</span>
          <h1>Расскажите о доходе</h1>
          <p className="lead">Достаточно примерной суммы в месяц. Ничего подтверждать сейчас не нужно.</p>
          <ChoiceGroup value={form.incomeRange} options={incomeRanges} onChange={(value) => update('incomeRange', value)} ariaLabel="Ежемесячный доход" />
          {form.incomeRange === 'custom' && <>
            <label className="field-label" htmlFor="customIncome">Доход в месяц</label>
            <input id="customIncome" className="text-field" inputMode="numeric" value={formatMoney(form.customIncome)} onChange={(event) => update('customIncome', event.target.value.replace(/\D/g, ''))} placeholder="Например, 180 000 ₽" />
          </>}
          <h2>Есть действующие кредиты?</h2>
          <ChoiceGroup value={form.hasLoans} options={[{ value: 'no', label: 'Нет' }, { value: 'yes', label: 'Да, есть' }]} onChange={(value) => update('hasLoans', value)} ariaLabel="Действующие кредиты" />
          {form.hasLoans === 'yes' && <>
            <label className="field-label" htmlFor="loanPayment">Ежемесячный платёж по кредитам</label>
            <input id="loanPayment" className="text-field" inputMode="numeric" value={formatMoney(form.loanPayment)} onChange={(event) => update('loanPayment', event.target.value.replace(/\D/g, ''))} placeholder="Например, 25 000 ₽" />
          </>}
        </>}

        {step === 4 && <>
          <span className="eyebrow">Звонок эксперта</span>
          <h1>Когда вам удобно поговорить?</h1>
          <p className="lead">Выберите время в ближайшие три дня. Эксперт партнёра позвонит вам сам.</p>
          <div className="days" role="radiogroup" aria-label="Дата звонка">
            {callDays.map((day) => <button key={day.id} type="button" className={`day-choice ${selectedDay === day.id ? 'day-choice--selected' : ''}`} onClick={() => { setSelectedDay(day.id); update('callSlot', '') }} role="radio" aria-checked={selectedDay === day.id}><span>{day.day}</span><strong>{day.date}</strong></button>)}
          </div>
          {selectedDay && <>
            <h2>Время звонка</h2>
            <div className="time-slots" role="radiogroup" aria-label="Время звонка">
              {['10:00–12:00', '12:00–15:00', '15:00–18:00'].map((time) => {
                const value = `${callDays.find((day) => day.id === selectedDay)?.date}|${time}`
                return <button className={`time-choice ${form.callSlot === value ? 'time-choice--selected' : ''}`} role="radio" aria-checked={form.callSlot === value} type="button" key={time} onClick={() => update('callSlot', value)}>{time}</button>
              })}
            </div>
          </>}
          <div className="consents">
            <p>Нажимая «Продолжить», вы принимаете <a href="#service-consent">условия услуги</a> и <a href="#data-consent">даёте согласие на обработку данных</a>.</p>
            {!activeContext.marketingConsentAlreadyGiven && <label className="marketing-check"><input type="checkbox" checked={form.marketingConsent} onChange={(event) => update('marketingConsent', event.target.checked)} /><span>Хочу получать новости и предложения Циана</span></label>}
          </div>
        </>}
      </section>

      <div className="form-footer">
        {errors.length > 0 && <div className="error-box" role="alert">{errors[0]}</div>}
        <button className="primary-button" type="button" onClick={continueForm}>{step === 4 ? 'Продолжить' : 'Дальше'}</button>
      </div>
    </main>
  )
}

export default App
