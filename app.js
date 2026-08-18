/**
 * MEDICORE ENTERPRISE HEALTHCARE LOGIN PORTAL
 * Interactive Authentication Logic, Security Norms & UI Behaviors
 */

document.addEventListener('DOMContentLoaded', () => {
  // -------------------------------------------------------------------------
  // DOM Elements
  // -------------------------------------------------------------------------
  const html = document.documentElement;
  const themeToggle = document.getElementById('themeToggle');
  
  // Role switcher tabs & header
  const roleTabs = document.querySelectorAll('.role-tab');
  const roleBadgeText = document.getElementById('roleBadgeText');
  const formHeading = document.getElementById('formHeading');
  const formSubtitle = document.getElementById('formSubtitle');
  const identifierLabel = document.getElementById('identifierLabel');
  const identifierHint = document.getElementById('identifierHint');
  const identifierIcon = document.getElementById('identifierIcon');
  const userIdentifier = document.getElementById('userIdentifier');
  const userPassword = document.getElementById('userPassword');
  const institutionGroup = document.getElementById('institutionGroup');
  const deptGroup = document.getElementById('deptGroup');
  const dobGroup = document.getElementById('dobGroup');
  const loginForm = document.getElementById('loginForm');
  const submitBtn = document.getElementById('submitBtn');
  const btnSpinner = document.getElementById('btnSpinner');
  const btnText = document.getElementById('btnText');
  const clearIdentifierBtn = document.getElementById('clearIdentifierBtn');
  const passwordToggleBtn = document.getElementById('passwordToggleBtn');
  const eyeOpen = passwordToggleBtn.querySelector('.eye-open');
  const eyeClosed = passwordToggleBtn.querySelector('.eye-closed');
  
  // Password policy elements
  const passwordPolicyCard = document.getElementById('passwordPolicyCard');
  const strengthBar = document.getElementById('strengthBar');
  const strengthLabel = document.getElementById('strengthLabel');
  const strengthScoreText = document.getElementById('strengthScoreText');
  const ruleLength = document.getElementById('ruleLength');
  const ruleUpper = document.getElementById('ruleUpper');
  const ruleNumber = document.getElementById('ruleNumber');
  const ruleSpecial = document.getElementById('ruleSpecial');
  
  // Error message spans
  const identifierError = document.getElementById('identifierError');
  const passwordError = document.getElementById('passwordError');

  // Modals
  const mfaModal = document.getElementById('mfaModal');
  const closeMfaModal = document.getElementById('closeMfaModal');
  const cancelMfaBtn = document.getElementById('cancelMfaBtn');
  const verifyMfaBtn = document.getElementById('verifyMfaBtn');
  const mfaSpinner = document.getElementById('mfaSpinner');
  const mfaBtnText = document.getElementById('mfaBtnText');
  const mfaTimer = document.getElementById('mfaTimer');
  const resendOtpBtn = document.getElementById('resendOtpBtn');
  const otpInputs = document.querySelectorAll('.otp-digit');
  
  const forgotModal = document.getElementById('forgotModal');
  const forgotPasswordBtn = document.getElementById('forgotPasswordBtn');
  const closeForgotModal = document.getElementById('closeForgotModal');
  const cancelForgotBtn = document.getElementById('cancelForgotBtn');
  const sendRecoveryBtn = document.getElementById('sendRecoveryBtn');
  const recoveryEmail = document.getElementById('recoveryEmail');

  const hipaaModal = document.getElementById('hipaaModal');
  const hipaaNoticeLink = document.getElementById('hipaaNoticeLink');
  const privacyTermsLink = document.getElementById('privacyTermsLink');
  const closeHipaaModal = document.getElementById('closeHipaaModal');
  const acknowledgeHipaaBtn = document.getElementById('acknowledgeHipaaBtn');
  const emergencyOverrideBtn = document.getElementById('emergencyOverrideBtn');

  // Demo chips & SSO
  const demoChips = document.querySelectorAll('.demo-chip');
  const ssoBtns = document.querySelectorAll('.sso-btn');
  const toastContainer = document.getElementById('toastContainer');

  // -------------------------------------------------------------------------
  // State Management
  // -------------------------------------------------------------------------
  let currentRole = 'doctor';
  let otpCountdownInterval = null;

  const roleConfigs = {
    doctor: {
      badge: 'Medical Staff Gateway',
      heading: 'Sign In to Clinical EHR',
      subtitle: 'Enter your institutional email or NPI credentials to access patient charts.',
      label: 'Institutional Email / NPI ID',
      hint: 'e.g., s.chen@stjude.health or 10-digit NPI',
      placeholder: 's.chen@stjude.health or NPI ID',
      showDept: true,
      showInstitution: true,
      showDob: false,
      btnLabel: 'Authenticate & Access EHR'
    },
    patient: {
      badge: 'Patient Health Portal',
      heading: 'Sign In to Patient Nexus',
      subtitle: 'Access your secure medical records, lab results, and telehealth appointments.',
      label: 'Patient MRN / ABHA / Email',
      hint: 'e.g., MRN-948201 or personal email',
      placeholder: 'MRN-948201 or user@mail.com',
      showDept: false,
      showInstitution: false,
      showDob: true,
      btnLabel: 'Access My Health Records'
    },
    admin: {
      badge: 'Hospital System Administrator',
      heading: 'Hospital Security & Root Admin',
      subtitle: 'Authorized hospital administrators and clinical IT infrastructure engineers.',
      label: 'Enterprise Root Admin ID',
      hint: 'e.g., admin.root@medicore.net',
      placeholder: 'admin.root@medicore.net',
      showDept: false,
      showInstitution: true,
      showDob: false,
      btnLabel: 'Authorize Root Session'
    }
  };

  const demoAccounts = {
    doctor: {
      identifier: 'dr.schen@stjude.health',
      password: 'ClinicalDoctor#2026',
      dept: 'cardio'
    },
    patient: {
      identifier: 'MRN-948201',
      password: 'PatientPortal#2026',
      dob: '1988-06-14'
    },
    admin: {
      identifier: 'admin.root@medicore.net',
      password: 'AdminSecurity#2026'
    }
  };

  // -------------------------------------------------------------------------
  // Theme Toggle (Dark / Light) with Local Storage
  // -------------------------------------------------------------------------
  const savedTheme = localStorage.getItem('medicore_theme') || 'dark';
  html.setAttribute('data-theme', savedTheme);

  themeToggle.addEventListener('click', () => {
    const active = html.getAttribute('data-theme');
    const newTheme = active === 'dark' ? 'light' : 'dark';
    html.setAttribute('data-theme', newTheme);
    localStorage.setItem('medicore_theme', newTheme);
    showToast(`Switched to ${newTheme === 'dark' ? 'Dark Medical' : 'Clean Light'} theme`, 'info');
  });

  // -------------------------------------------------------------------------
  // Role Switching Logic
  // -------------------------------------------------------------------------
  function setRole(roleKey) {
    if (!roleConfigs[roleKey]) return;
    currentRole = roleKey;

    roleTabs.forEach(tab => {
      const isCurrent = tab.dataset.role === roleKey;
      tab.classList.toggle('active', isCurrent);
      tab.setAttribute('aria-selected', isCurrent);
    });

    const cfg = roleConfigs[roleKey];
    roleBadgeText.textContent = cfg.badge;
    formHeading.textContent = cfg.heading;
    formSubtitle.textContent = cfg.subtitle;
    identifierLabel.textContent = cfg.label;
    identifierHint.textContent = cfg.hint;
    userIdentifier.placeholder = cfg.placeholder;
    btnText.textContent = cfg.btnLabel;

    deptGroup.style.display = cfg.showDept ? 'flex' : 'none';
    institutionGroup.style.display = cfg.showInstitution ? 'flex' : 'none';
    dobGroup.style.display = cfg.showDob ? 'flex' : 'none';

    clearErrors();
  }

  roleTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      setRole(tab.dataset.role);
    });
  });

  // -------------------------------------------------------------------------
  // Password Visibility Toggle
  // -------------------------------------------------------------------------
  passwordToggleBtn.addEventListener('click', () => {
    const isPassword = userPassword.getAttribute('type') === 'password';
    userPassword.setAttribute('type', isPassword ? 'text' : 'password');
    eyeOpen.style.display = isPassword ? 'none' : 'block';
    eyeClosed.style.display = isPassword ? 'block' : 'none';
  });

  // Clear Input Button
  userIdentifier.addEventListener('input', () => {
    clearIdentifierBtn.hidden = userIdentifier.value.length === 0;
  });

  clearIdentifierBtn.addEventListener('click', () => {
    userIdentifier.value = '';
    clearIdentifierBtn.hidden = true;
    userIdentifier.focus();
  });

  // -------------------------------------------------------------------------
  // Live Password Strength & Policy Checker (Healthcare Norms)
  // -------------------------------------------------------------------------
  userPassword.addEventListener('focus', () => {
    passwordPolicyCard.classList.add('active');
  });

  userPassword.addEventListener('input', () => {
    const val = userPassword.value;
    if (val.length > 0) {
      passwordPolicyCard.classList.add('active');
    }

    const hasLength = val.length >= 8;
    const hasUpper = /[A-Z]/.test(val);
    const hasNumber = /[0-9]/.test(val);
    const hasSpecial = /[@$!%*?&#^()_\-+=[\]{};:,.<>]/.test(val);

    updatePolicyRule(ruleLength, hasLength);
    updatePolicyRule(ruleUpper, hasUpper);
    updatePolicyRule(ruleNumber, hasNumber);
    updatePolicyRule(ruleSpecial, hasSpecial);

    const score = [hasLength, hasUpper, hasNumber, hasSpecial].filter(Boolean).length;
    strengthScoreText.textContent = `${score}/4 requirements`;

    strengthBar.className = 'strength-bar-fill';
    if (score === 0) {
      strengthLabel.textContent = 'None';
    } else if (score === 1) {
      strengthBar.classList.add('strength-weak');
      strengthLabel.textContent = 'Weak';
      strengthLabel.style.color = 'var(--brand-rose)';
    } else if (score <= 2) {
      strengthBar.classList.add('strength-fair');
      strengthLabel.textContent = 'Moderate';
      strengthLabel.style.color = 'var(--brand-amber)';
    } else if (score === 3) {
      strengthBar.classList.add('strength-good');
      strengthLabel.textContent = 'Good';
      strengthLabel.style.color = 'var(--brand-teal)';
    } else if (score === 4) {
      strengthBar.classList.add('strength-strong');
      strengthLabel.textContent = 'Enterprise Strong';
      strengthLabel.style.color = 'var(--brand-emerald)';
    }
  });

  function updatePolicyRule(el, isValid) {
    el.classList.toggle('valid', isValid);
  }

  // -------------------------------------------------------------------------
  // Quick-Fill Demo Accounts
  // -------------------------------------------------------------------------
  demoChips.forEach(chip => {
    chip.addEventListener('click', () => {
      const fillRole = chip.dataset.fill;
      setRole(fillRole);
      const data = demoAccounts[fillRole];

      userIdentifier.value = data.identifier;
      userPassword.value = data.password;
      clearIdentifierBtn.hidden = false;

      // Trigger password strength update
      userPassword.dispatchEvent(new Event('input'));

      if (data.dept && document.getElementById('deptSelect')) {
        document.getElementById('deptSelect').value = data.dept;
      }
      if (data.dob && document.getElementById('patientDob')) {
        document.getElementById('patientDob').value = data.dob;
      }

      showToast(`Loaded ${chip.textContent} credentials for testing`, 'info');
    });
  });

  // -------------------------------------------------------------------------
  // Form Submission & Validation
  // -------------------------------------------------------------------------
  loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    clearErrors();

    const identifierVal = userIdentifier.value.trim();
    const passwordVal = userPassword.value;

    let hasError = false;

    if (!identifierVal) {
      showError(userIdentifier, identifierError, 'Please enter your institutional email or Medical ID');
      hasError = true;
    } else if (identifierVal.length < 3) {
      showError(userIdentifier, identifierError, 'Identifier is too short');
      hasError = true;
    }

    if (!passwordVal) {
      showError(userPassword, passwordError, 'Password is required');
      hasError = true;
    } else if (passwordVal.length < 6) {
      showError(userPassword, passwordError, 'Password must be at least 8 characters per HIPAA policy');
      hasError = true;
    }

    if (hasError) return;

    // Simulate Enterprise Authentication Request
    submitBtn.disabled = true;
    btnSpinner.style.display = 'inline-block';
    btnText.textContent = 'Verifying Credentials...';

    setTimeout(() => {
      submitBtn.disabled = false;
      btnSpinner.style.display = 'none';
      btnText.textContent = roleConfigs[currentRole].btnLabel;

      // Launch 2FA Verification Modal (Clinical Zero-Trust standard)
      openModal(mfaModal);
      startOtpTimer();
      showToast('Credentials approved. 2FA security challenge dispatched.', 'success');
      
      // Auto focus first OTP box
      setTimeout(() => otpInputs[0]?.focus(), 150);
    }, 1000);
  });

  function showError(inputEl, msgEl, text) {
    inputEl.classList.add('is-invalid');
    msgEl.textContent = text;
  }

  function clearErrors() {
    [userIdentifier, userPassword].forEach(el => {
      el.classList.remove('is-invalid', 'is-valid');
    });
    identifierError.textContent = '';
    passwordError.textContent = '';
  }

  // -------------------------------------------------------------------------
  // 2FA / MFA OTP Auto-Advancing Inputs
  // -------------------------------------------------------------------------
  otpInputs.forEach((input, index) => {
    input.addEventListener('input', (e) => {
      const val = e.target.value;
      if (val && index < otpInputs.length - 1) {
        otpInputs[index + 1].focus();
      }
    });

    input.addEventListener('keydown', (e) => {
      if (e.key === 'Backspace' && !input.value && index > 0) {
        otpInputs[index - 1].focus();
      }
    });

    // Support paste full 6-digit code
    input.addEventListener('paste', (e) => {
      e.preventDefault();
      const pasteData = (e.clipboardData || window.clipboardData).getData('text').trim();
      if (/^\d{6}$/.test(pasteData)) {
        pasteData.split('').forEach((char, idx) => {
          if (otpInputs[idx]) otpInputs[idx].value = char;
        });
        otpInputs[otpInputs.length - 1].focus();
      }
    });
  });

  function startOtpTimer() {
    let timeLeft = 165; // 2m 45s
    clearInterval(otpCountdownInterval);

    function update() {
      const mins = Math.floor(timeLeft / 60);
      const secs = timeLeft % 60;
      mfaTimer.textContent = `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
      if (timeLeft <= 0) {
        clearInterval(otpCountdownInterval);
        mfaTimer.textContent = '00:00 (Expired)';
      }
      timeLeft--;
    }

    update();
    otpCountdownInterval = setInterval(update, 1000);
  }

  resendOtpBtn.addEventListener('click', () => {
    startOtpTimer();
    showToast('New 6-digit cryptographic passcode sent to registered device.', 'info');
  });

  verifyMfaBtn.addEventListener('click', () => {
    const code = Array.from(otpInputs).map(i => i.value).join('');
    if (code.length < 6) {
      showToast('Please enter all 6 digits of your authenticator code', 'error');
      return;
    }

    verifyMfaBtn.disabled = true;
    mfaSpinner.style.display = 'inline-block';
    mfaBtnText.textContent = 'Authorizing...';

    setTimeout(() => {
      verifyMfaBtn.disabled = false;
      mfaSpinner.style.display = 'none';
      mfaBtnText.textContent = 'Verify & Unlock EHR';
      closeModal(mfaModal);
      clearInterval(otpCountdownInterval);

      // Authenticated state
      showToast(`Authorization successful! Welcome, ${userIdentifier.value || 'Dr. Chen'}. Redirecting to Clinical Station...`, 'success');
      
      // Visual feedback on the login button
      submitBtn.style.background = 'linear-gradient(135deg, #10b981 0%, #059669 100%)';
      btnText.textContent = '✓ Workstation Session Active';
    }, 1200);
  });

  // -------------------------------------------------------------------------
  // Modals Open / Close Helper
  // -------------------------------------------------------------------------
  function openModal(modal) {
    modal.classList.add('open');
    modal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  }

  function closeModal(modal) {
    modal.classList.remove('open');
    modal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }

  closeMfaModal.addEventListener('click', () => closeModal(mfaModal));
  cancelMfaBtn.addEventListener('click', () => closeModal(mfaModal));

  // Forgot Password Modal
  forgotPasswordBtn.addEventListener('click', (e) => {
    e.preventDefault();
    openModal(forgotModal);
    recoveryEmail.value = userIdentifier.value || '';
  });

  closeForgotModal.addEventListener('click', () => closeModal(forgotModal));
  cancelForgotBtn.addEventListener('click', () => closeModal(forgotModal));

  sendRecoveryBtn.addEventListener('click', () => {
    const email = recoveryEmail.value.trim();
    if (!email) {
      showToast('Please specify a registered institutional email or ID', 'error');
      return;
    }
    closeModal(forgotModal);
    showToast(`Password reset instructions dispatched to ${email}`, 'success');
  });

  // HIPAA Modal
  hipaaNoticeLink.addEventListener('click', (e) => {
    e.preventDefault();
    openModal(hipaaModal);
  });

  privacyTermsLink.addEventListener('click', (e) => {
    e.preventDefault();
    openModal(hipaaModal);
  });

  closeHipaaModal.addEventListener('click', () => closeModal(hipaaModal));
  acknowledgeHipaaBtn.addEventListener('click', () => closeModal(hipaaModal));

  // Emergency Override Protocol
  emergencyOverrideBtn.addEventListener('click', (e) => {
    e.preventDefault();
    const confirmed = confirm(
      '⚠️ HOSPITAL EMERGENCY BREAK-GLASS PROTOCOL\n\n' +
      'Emergency access bypasses standard authentication and logs this event directly with the Hospital Chief Information Security Officer (CISO).\n\n' +
      'Are you sure you want to trigger Code Blue Emergency EHR Override?'
    );
    if (confirmed) {
      showToast('🚨 Emergency Override Activated. Session logged per 45 CFR § 164.312.', 'error');
    }
  });

  // Backdrop click & Escape key listener
  document.querySelectorAll('.modal-backdrop').forEach(backdrop => {
    backdrop.addEventListener('click', (e) => {
      if (e.target === backdrop) closeModal(backdrop);
    });
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      document.querySelectorAll('.modal-backdrop.open').forEach(closeModal);
    }
  });

  // -------------------------------------------------------------------------
  // Single Sign-On (SSO) Simulation
  // -------------------------------------------------------------------------
  ssoBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const provider = btn.dataset.sso;
      const names = {
        epic: 'Epic Systems EHR Sync',
        azure: 'Microsoft Azure AD Healthcare Cloud',
        okta: 'Okta Enterprise Healthcare SSO'
      };
      showToast(`Initiating SAML 2.0 / OIDC Handshake with ${names[provider]}...`, 'info');
      setTimeout(() => {
        showToast(`SSO Handshake with ${names[provider]} verified!`, 'success');
      }, 1400);
    });
  });

  // -------------------------------------------------------------------------
  // Toast Notification Utility
  // -------------------------------------------------------------------------
  function showToast(message, type = 'info') {
    const icons = {
      success: '✓',
      error: '⚠️',
      info: 'ℹ️'
    };

    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `
      <span class="toast-icon">${icons[type] || 'ℹ️'}</span>
      <span class="toast-message">${message}</span>
    `;

    toastContainer.appendChild(toast);

    setTimeout(() => {
      toast.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
      toast.style.opacity = '0';
      toast.style.transform = 'translateX(50px)';
      setTimeout(() => toast.remove(), 300);
    }, 4000);
  }
});
