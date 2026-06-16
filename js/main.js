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
      el.addEventListener('mouseenter', () => { ring.style.width='48px';ring.style.height='48px';ring.style.borderColor='rgba(15,212,180,0.7)' })
      el.addEventListener('mouseleave', () => { ring.style.width='32px';ring.style.height='32px';ring.style.borderColor='rgba(15,212,180,0.5)' })
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


  // ── Budget selector ─────────────────────────────────────────
  const budgetOpts   = document.querySelectorAll('.budget-opt')
  const budgetHidden = document.getElementById('budget-hidden')
  budgetOpts.forEach(opt => {
    opt.addEventListener('click', () => {
      budgetOpts.forEach(o => o.classList.remove('selected'))
      opt.classList.add('selected')
      budgetHidden.value = opt.dataset.val
    })
  })

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

  // ── Quote form ───────────────────────────────────────────────
  const form    = document.getElementById('quote-form')
  const success = document.getElementById('form-success')

  form.addEventListener('submit', e => {
    e.preventDefault()
    let valid = true
    form.querySelectorAll('[required]').forEach(field => {
      if (!field.value.trim()) {
        field.style.borderColor = '#ef4444'
        field.style.boxShadow   = '0 0 0 3px rgba(239,68,68,0.15)'
        valid = false
        setTimeout(() => { field.style.borderColor=''; field.style.boxShadow='' }, 2500)
      }
    })
    if (!valid) return

    const d = new FormData(form)
    const get = k => d.get(k) || ''
    const svcs = d.getAll('svc').join(', ') || 'None selected'

    const subject = encodeURIComponent('Project Brief from ' + get('fname') + ' ' + get('lname'))
    const body = encodeURIComponent(
      'Name: ' + get('fname') + ' ' + get('lname') + '\n' +
      'Email: ' + get('email') + '\n' +
      'Company: ' + get('company') + '\n' +
      'Project Type: ' + get('project_type') + '\n' +
      'Services: ' + svcs + '\n' +
      'Budget: ' + get('budget') + '\n' +
      'Timeline: ' + get('timeline') + '\n\n' +
      'Message:\n' + get('message')
    )

    const btn = form.querySelector('.form-submit')
    btn.textContent = 'Opening email...'
    btn.style.opacity = '0.7'

    const link = document.createElement('a')
    link.href = 'mailto:novaflowbuil@gmail.com?subject=' + subject + '&body=' + body
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)

    setTimeout(() => {
      form.style.transition = 'opacity 0.4s'
      form.style.opacity    = '0'
      setTimeout(() => {
        form.style.display    = 'none'
        success.classList.add('visible')
      }, 400)
    }, 800)
  })

  // Reset field error on input
  form.querySelectorAll('input,select,textarea').forEach(f => {
    f.addEventListener('input', () => { f.style.borderColor=''; f.style.boxShadow='' })
  })

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

  // ── Currency switcher ────────────────────────────────────────
  const CURRENCIES = {
    USD: { rate: 1,     symbol: 'US$' },
    NZD: { rate: 1.69,  symbol: 'NZ$' },
    AUD: { rate: 1.52,  symbol: 'A$'  },
    GBP: { rate: 0.79,  symbol: '£'   },
    EUR: { rate: 0.92,  symbol: '€'   },
    LKR: { rate: 330,   symbol: 'Rs'  },
    SGD: { rate: 1.35,  symbol: 'S$'  },
    CAD: { rate: 1.37,  symbol: 'CA$' },
  }
  const currencySelect = document.getElementById('currency-select')
  const priceAmounts   = document.querySelectorAll('.price-amount[data-usd]')
  const priceSymbols   = document.querySelectorAll('.price-currency')

  function fmt(n) {
    return n >= 1000 ? n.toLocaleString('en', { maximumFractionDigits: 0 }) : Math.round(n).toString()
  }

  if (currencySelect) {
    currencySelect.addEventListener('change', () => {
      const cur = CURRENCIES[currencySelect.value]
      priceAmounts.forEach(el => {
        el.textContent = fmt(parseFloat(el.dataset.usd) * cur.rate)
      })
      priceSymbols.forEach(el => { el.textContent = cur.symbol })
    })
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