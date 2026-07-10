(function() {
  // ── Cursor ──────────────────────────────────────────────────
  const dot  = document.getElementById('cursor-dot')
  const ring = document.getElementById('cursor-ring')
  if (dot && ring && window.matchMedia('(hover:hover)').matches) {
    let mx = -200, my = -200, rx = -200, ry = -200
    document.addEventListener('mousemove', e => { mx = e.clientX; my = e.clientY })
    ;(function animCursor() {
      rx += (mx - rx) * 0.1; ry += (my - ry) * 0.1
      dot.style.left  = mx + 'px'; dot.style.top  = my + 'px'
      ring.style.left = rx + 'px'; ring.style.top = ry + 'px'
      requestAnimationFrame(animCursor)
    })()
    document.querySelectorAll('a,button,.budget-opt,.check-item').forEach(el => {
      el.addEventListener('mouseenter', () => { ring.style.width='48px';ring.style.height='48px';ring.style.borderColor='rgba(108,99,255,0.7)' })
      el.addEventListener('mouseleave', () => { ring.style.width='32px';ring.style.height='32px';ring.style.borderColor='rgba(108,99,255,0.5)' })
    })
  }

  // ── Loader ──────────────────────────────────────────────────
  const loader = document.getElementById('loader')
  const fill   = document.getElementById('loader-fill')
  const pct    = document.getElementById('loader-pct')
  let progress = 0
  const ticker = setInterval(() => {
    const inc = progress < 60 ? Math.random()*22 : progress < 85 ? Math.random()*12 : Math.random()*6
    progress = Math.min(progress + inc, 100)
    fill.style.width = progress + '%'
    pct.textContent  = Math.floor(progress) + '%'
    if (progress >= 100) {
      clearInterval(ticker)
      setTimeout(() => {
        loader.style.transition = 'opacity 0.4s, transform 0.5s cubic-bezier(0.76,0,0.24,1)'
        loader.style.opacity    = '0'
        loader.style.transform  = 'translateY(-100%)'
        setTimeout(() => {
          loader.remove()
          // Reveal any in-viewport elements that loaded while loader was showing
          document.querySelectorAll('.reveal:not(.visible)').forEach(el => {
            const r = el.getBoundingClientRect()
            if (r.top < window.innerHeight && r.bottom > 0) el.classList.add('visible')
          })
        }, 600)
      }, 200)
    }
  }, 45)

  // ── Nav ─────────────────────────────────────────────────────
  const nav    = document.getElementById('nav')
  const burger = document.getElementById('burger')
  const mMenu  = document.getElementById('mobile-menu')
  let menuOpen = false

  window.addEventListener('scroll', () => {
    nav.classList.toggle('solid', window.scrollY > 50)
  }, { passive: true })

  burger.addEventListener('click', () => {
    menuOpen = !menuOpen
    burger.classList.toggle('open', menuOpen)
    mMenu.classList.toggle('open', menuOpen)
    document.body.style.overflow = menuOpen ? 'hidden' : ''
  })
  mMenu.querySelectorAll('.mob-link').forEach(l => {
    l.addEventListener('click', () => {
      menuOpen = false
      burger.classList.remove('open')
      mMenu.classList.remove('open')
      document.body.style.overflow = ''
    })
  })

  // ── Scroll reveals ───────────────────────────────────────────
  const observer = new IntersectionObserver(entries => {
    entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('visible'); observer.unobserve(e.target) } })
  }, { threshold: 0.05 })
  document.querySelectorAll('.reveal').forEach(el => observer.observe(el))

  // Immediately reveal elements already in the viewport
  requestAnimationFrame(() => {
    document.querySelectorAll('.reveal:not(.visible)').forEach(el => {
      const r = el.getBoundingClientRect()
      if (r.top < window.innerHeight && r.bottom > 0) el.classList.add('visible')
    })
  })

  // Safety fallback: reveal everything after 2.5s
  setTimeout(() => document.querySelectorAll('.reveal:not(.visible)').forEach(el => el.classList.add('visible')), 2500)


  // ── FAQ accordion ────────────────────────────────────────────
  document.querySelectorAll('.faq-item').forEach(item => {
    item.querySelector('.faq-q').addEventListener('click', () => {
      const isOpen = item.classList.contains('open')
      document.querySelectorAll('.faq-item').forEach(i => {
        i.classList.remove('open')
        i.querySelector('.faq-a').style.maxHeight = '0'
      })
      if (!isOpen) {
        item.classList.add('open')
        item.querySelector('.faq-a').style.maxHeight = item.querySelector('.faq-a').scrollHeight + 'px'
      }
    })
  })

  // ── Pricing accordion ────────────────────────────────────────
  const paItems = document.querySelectorAll('.pa-item')

  function openPa(item) {
    item.classList.add('pa-open')
    item.querySelector('.pa-header').setAttribute('aria-expanded', 'true')
    const body = item.querySelector('.pa-body')
    body.style.maxHeight = body.scrollHeight + 'px'
  }
  function closePa(item) {
    item.classList.remove('pa-open')
    item.querySelector('.pa-header').setAttribute('aria-expanded', 'false')
    item.querySelector('.pa-body').style.maxHeight = '0'
  }

  if (paItems.length) openPa(paItems[0])

  paItems.forEach(item => {
    item.querySelector('.pa-header').addEventListener('click', () => {
      const isOpen = item.classList.contains('pa-open')
      paItems.forEach(i => closePa(i))
      if (!isOpen) openPa(item)
    })
  })

  // ── Quote form ───────────────────────────────────────────────
  const form      = document.getElementById('quote-form')
  const success   = document.getElementById('form-success')
  const resetBtn  = document.getElementById('form-reset-btn')
  const generalErr = form.querySelector('.form-error-general')
  const emailRe   = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

  function fieldError(field) {
    const group = field.closest('.form-group')
    return group ? group.querySelector('.field-error') : null
  }

  function showFieldError(field, message) {
    field.classList.add('field-invalid')
    field.classList.add('shake')
    setTimeout(() => field.classList.remove('shake'), 500)
    const err = fieldError(field)
    if (err) { err.textContent = message; err.classList.add('visible') }
  }

  function clearFieldError(field) {
    field.classList.remove('field-invalid')
    const err = fieldError(field)
    if (err) { err.classList.remove('visible'); err.textContent = '' }
  }

  function validateForm() {
    let valid = true
    form.querySelectorAll('[required]').forEach(field => {
      if (!field.value.trim()) {
        showFieldError(field, 'This field is required.')
        valid = false
      } else if (field.type === 'email' && !emailRe.test(field.value.trim())) {
        showFieldError(field, 'Please enter a valid email address.')
        valid = false
      } else {
        clearFieldError(field)
      }
    })
    return valid
  }

  form.addEventListener('submit', e => {
    e.preventDefault()
    generalErr.classList.remove('visible')

    if (!validateForm()) return

    const btn = form.querySelector('.form-submit')
    const btnOriginalText = btn.textContent
    btn.textContent = 'Sending...'
    btn.style.opacity = '0.7'
    btn.disabled = true

    const d = new FormData(form)
    const get = k => d.get(k) || ''
    const templateParams = {
      to_email: 'novaflowbuild@gmail.com',
      from_name: (get('fname') + ' ' + get('lname')).trim(),
      from_email: get('email'),
      reply_to: get('email'),
      company: get('company'),
      project_type: get('project_type'),
      services: d.getAll('svc').join(', ') || 'None selected',
      timeline: get('timeline'),
      message: get('message')
    }

    emailjs.send('service_xzbh7j6', 'template_e9u8jyn', templateParams)
      .then(() => {
        form.style.transition = 'opacity 0.4s'
        form.style.opacity    = '0'
        setTimeout(() => {
          form.style.display = 'none'
          success.classList.add('visible')
        }, 400)
      })
      .catch(err => {
        console.error('EmailJS send failed:', err)
        generalErr.textContent = 'Something went wrong. Please try again or WhatsApp us on 022 508 1575'
        generalErr.classList.add('visible')
      })
      .finally(() => {
        btn.textContent = btnOriginalText
        btn.style.opacity = ''
        btn.disabled = false
      })
  })

  // Reset field error on input
  form.querySelectorAll('input,select,textarea').forEach(f => {
    f.addEventListener('input', () => clearFieldError(f))
  })

  // "Send Another Message" — reset and show the form again
  if (resetBtn) {
    resetBtn.addEventListener('click', () => {
      form.reset()
      form.querySelectorAll('input,select,textarea').forEach(f => clearFieldError(f))
      success.classList.remove('visible')
      form.style.display = ''
      requestAnimationFrame(() => { form.style.opacity = '1' })
    })
  }

  // ── Portfolio expand ─────────────────────────────────────────
  document.querySelectorAll('.portfolio-card').forEach(card => {
    const btn  = card.querySelector('.portfolio-expand-btn')
    const desc = card.querySelector('.portfolio-desc')
    if (!btn || !desc) return
    btn.addEventListener('click', e => {
      e.stopPropagation()
      const isOpen = btn.classList.contains('open')
      btn.classList.toggle('open', !isOpen)
      desc.style.maxHeight = isOpen ? '0' : desc.scrollHeight + 'px'
    })
  })

  // ── Count-up stats ───────────────────────────────────────────
  const statEls = document.querySelectorAll('.stat-num[data-count]')
  if (statEls.length) {
    const countObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return
        const el = entry.target
        const target = parseInt(el.dataset.count, 10)
        const duration = 1400
        const start = performance.now()
        function step(now) {
          const elapsed = now - start
          const progress = Math.min(elapsed / duration, 1)
          const ease = 1 - Math.pow(1 - progress, 3)
          el.textContent = Math.floor(ease * target)
          if (progress < 1) requestAnimationFrame(step)
          else el.textContent = target
        }
        requestAnimationFrame(step)
        countObserver.unobserve(el)
      })
    }, { threshold: 0.5 })
    statEls.forEach(el => countObserver.observe(el))
  }

  // ── Smooth scroll for anchor links ──────────────────────────
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', e => {
      const target = document.querySelector(a.getAttribute('href'))
      if (target) {
        e.preventDefault()
        const offset = target.getBoundingClientRect().top + window.scrollY - 80
        window.scrollTo({ top: offset, behavior: 'smooth' })
      }
    })
  })


})()