const menuToggle = document.querySelector('.menu-toggle');
const navLinks = document.querySelector('.nav-links');

// Mobile Menu Toggle
menuToggle.addEventListener('click', () => {
    const isActive = navLinks.classList.contains('active');
    
    if (isActive) {
        navLinks.classList.remove('active');
        menuToggle.setAttribute('aria-expanded', 'false');
    } else {
        navLinks.classList.add('active');
        menuToggle.setAttribute('aria-expanded', 'true');
    }
});

document.querySelectorAll('.nav-links a').forEach(link => {
    link.addEventListener('click', () => {
        navLinks.classList.remove('active');
        menuToggle.setAttribute('aria-expanded', 'false');
    });
});

// Sticky Header
window.addEventListener('scroll', () => {
    const header = document.querySelector('header');
    if (window.scrollY > 50) {
        header.classList.add('scrolled');
    } else {
        header.classList.remove('scrolled');
    }
});

// Scroll Reveal Animations & Odometers
const fadeElements = document.querySelectorAll('.fade-in');
const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
        if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            
            // Trigger Odometers on scroll
            const odometers = entry.target.querySelectorAll('.odometer');
            odometers.forEach(el => {
                if (!el.classList.contains('counted')) {
                    const target = parseInt(el.getAttribute('data-target'));
                    animateValue(el, 0, target, 2000);
                    el.classList.add('counted');
                }
            });
        }
    });
}, { threshold: 0.15, rootMargin: '0px 0px -60px 0px' });

fadeElements.forEach(el => observer.observe(el));

// Number Counter Animation Logic (easeOutQuart)
function animateValue(obj, start, end, duration) {
    let startTimestamp = null;
    const step = (timestamp) => {
        if (!startTimestamp) startTimestamp = timestamp;
        const progress = Math.min((timestamp - startTimestamp) / duration, 1);
        const easeProgress = 1 - Math.pow(1 - progress, 4); // ease deceleration
        obj.innerHTML = Math.floor(easeProgress * (end - start) + start);
        if (progress < 1) {
            window.requestAnimationFrame(step);
        } else {
            obj.innerHTML = end;
        }
    };
    window.requestAnimationFrame(step);
}

// Form Submission with FormSubmit via AJAX
const contactForm = document.getElementById('contact-form');
if (contactForm) {
    contactForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const submitBtn = contactForm.querySelector('button[type="submit"]');
        const originalBtnText = submitBtn.textContent;
        submitBtn.textContent = 'Enviando...';
        submitBtn.disabled = true;

        try {
            const formData = new FormData(contactForm);
            
            const response = await fetch(contactForm.action, {
                method: 'POST',
                body: formData,
                headers: {
                    'Accept': 'application/json'
                }
            });

            if (response.ok) {
                alert('Obrigada! Sua mensagem foi enviada. Retornarei em breve.');
                contactForm.reset();
            } else {
                throw new Error('Falha no envio');
            }
        } catch (error) {
            alert('Houve um problema ao enviar sua mensagem. Por favor, tente pelo WhatsApp.');
        } finally {
            submitBtn.textContent = originalBtnText;
            submitBtn.disabled = false;
        }
    });
}

// -----------------------------------------------------------------------------
// QUIZ LÓGICA (DIAGNÓSTICO FINANCEIRO)
// -----------------------------------------------------------------------------
const quizState = {
    q1: null,
    q2: null,
    q3: null,
    q4: null,
    q5: []
};

let currentStep = 1;
const maxSteps = 7;
const quizForms = document.getElementById('quiz-forms');
const progressBar = document.getElementById('quiz-progress-fill');
const btnQuizBack = document.getElementById('quiz-btn-back');

function updateProgress(step) {
    if(!progressBar) return;
    const progress = Math.min((step / 6) * 100, 100);
    progressBar.style.width = `${progress}%`;
}

function showStep(step) {
    document.querySelectorAll('.quiz-step').forEach(el => {
        el.classList.remove('active');
    });
    const nextStepEl = document.querySelector(`.quiz-step[data-step="${step}"]`);
    if(nextStepEl) {
        nextStepEl.classList.add('active');
        currentStep = step;
        updateProgress(step);
    }
    
    if(btnQuizBack) {
        btnQuizBack.style.display = (step > 1 && step <= 5) ? 'flex' : 'none';
    }

    // Scroll automático para o topo do quiz no resultado (garante que no mobile ele veja o título)
    if (step === 6) {
        const quizContainer = document.querySelector('.quiz-container');
        if (quizContainer) {
            // Rola suavemente compensando o menu fixo (height do header ~80px)
            window.scrollTo({
                top: quizContainer.getBoundingClientRect().top + window.scrollY - 120,
                behavior: 'smooth'
            });
        }
    }
}

if(btnQuizBack) {
    btnQuizBack.addEventListener('click', () => {
        if(currentStep > 1 && currentStep <= 5) {
            showStep(currentStep - 1);
        }
    });
}

// Q1 a Q4 (Botões de opção única)
document.querySelectorAll('.quiz-option').forEach(btn => {
    btn.addEventListener('click', function() {
        const question = this.getAttribute('data-question');
        const val = this.value;
        
        // Remove selected class das outras opções da mesma pergunta
        const siblings = this.closest('.quiz-options').querySelectorAll('.quiz-option');
        siblings.forEach(sib => sib.classList.remove('selected'));
        this.classList.add('selected');
        
        quizState[question] = val;
        
        // Lógica de Pulo: Se Q1 for "não", pula para exibir Resultado Final
        if (question === 'q1' && val === 'nao') {
            quizState.q2 = null;
            quizState.q3 = null;
            quizState.q4 = null;
            quizState.q5 = [];
            finalizarQuiz();
            return;
        }
        
        // Avançar para o próximo passo rapidamente (aguarda milésimos apenas para o efeito visual)
        setTimeout(() => {
            showStep(currentStep + 1);
        }, 80);
    });
});

// Q5 (Múltipla Escolha)
const exclusiveCheckbox = document.querySelector('.exclusive-checkbox');
if(exclusiveCheckbox) {
    exclusiveCheckbox.addEventListener('change', function() {
        if(this.checked) {
            document.querySelectorAll('input[name="q5"]:not(.exclusive-checkbox)').forEach(cb => {
                cb.checked = false;
            });
        }
    });

    document.querySelectorAll('input[name="q5"]:not(.exclusive-checkbox)').forEach(cb => {
        cb.addEventListener('change', function() {
            if(this.checked) exclusiveCheckbox.checked = false;
        });
    });
}

const btnNextQ5 = document.getElementById('btn-next-q5');
if(btnNextQ5) {
    btnNextQ5.addEventListener('click', () => {
        const checked = document.querySelectorAll('input[name="q5"]:checked');
        if(checked.length === 0) {
            alert('Por favor, selecione pelo menos uma opção.');
            return;
        }
        quizState.q5 = Array.from(checked).map(cb => cb.value);
        finalizarQuiz();
    });
}

function finalizarQuiz() {
    const resultado = calcularResultado();
    const ehLeadQuente = verificarLeadQuente();
    
    // Container final: Primeira parte é a captura, a segunda é o resultado
    const finalHtml = `
        <div class="result-box fade-in visible" id="capture-section">
            <h3 class="result-title" style="color: var(--primary);">Quase lá! Seu diagnóstico está pronto.</h3>
            <div class="result-desc">
                <p>Para visualizar o resultado da sua análise e entender o cenário financeiro da sua empresa, preencha os dados abaixo.</p>
            </div>
            
            <div style="background: var(--white); padding: 32px; border-radius: 8px; border: 1px solid var(--border); box-shadow: 0 8px 32px rgba(26,26,26,0.03); margin-top: 32px; text-align: left;">
                <form id="quiz-lead-form" class="quiz-form">
                    <div class="form-group" style="text-align: left;">
                        <label for="lead-name">Nome Completo</label>
                        <input type="text" id="lead-name" name="name" required placeholder="Seu nome completo">
                    </div>
                    <div class="form-group" style="text-align: left;">
                        <label for="lead-whatsapp">WhatsApp</label>
                        <input type="tel" id="lead-whatsapp" name="whatsapp" required placeholder="(61) 99999-9999">
                    </div>
                    <div class="form-group" style="text-align: left;">
                        <label for="lead-email">E-mail</label>
                        <input type="email" id="lead-email" name="email" required placeholder="seu@email.com">
                    </div>
                    <button type="submit" class="btn-cta w-full" id="btn-ver-resultado" style="display: flex; align-items: center; justify-content: center; gap: 8px;">
                        Ver Meu Diagnóstico Gratuito
                    </button>
                </form>
            </div>
        </div>

        <div class="result-box fade-in" id="result-section" style="display: none;">
            <span class="result-icon">${resultado.icone}</span>
            <h3 class="result-title ${resultado.classeDeRisco}">${resultado.titulo}</h3>
            <div class="result-desc">
                <p>${resultado.descricao}</p>
            </div>
            
            <div style="background: var(--white); padding: 32px; border-radius: 8px; border: 1px solid var(--border); box-shadow: 0 8px 32px rgba(26,26,26,0.03); margin-top: 32px;">
                <p style="color: var(--text-primary); margin-bottom: 24px; font-size: 16px; line-height: 1.6; font-weight: 500;">
                    Sua situação exige atenção profissional. Nossa equipe está à disposição para analisar estrategicamente o seu caso.
                </p>
                <button type="button" class="btn-cta w-full" id="btn-whatsapp-redirect" style="display: flex; align-items: center; justify-content: center; gap: 8px;">
                    <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.162-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/></svg>
                    ${resultado.botaoTexto}
                </button>
            </div>
        </div>
    `;
    
    document.getElementById('quiz-final-step').innerHTML = finalHtml;
    showStep(6);
    
    const quizLeadForm = document.getElementById('quiz-lead-form');
    const captureSection = document.getElementById('capture-section');
    const resultSection = document.getElementById('result-section');
    const btnWhatsapp = document.getElementById('btn-whatsapp-redirect');

    // Bind do formsubmit
    quizLeadForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const name = document.getElementById('lead-name').value;
        const whatsapp = document.getElementById('lead-whatsapp').value;
        const email = document.getElementById('lead-email').value;
        
        const submitBtn = quizLeadForm.querySelector('button[type="submit"]');
        submitBtn.textContent = 'Calculando...';
        submitBtn.disabled = true;

        const waMsg = encodeURIComponent(`Olá Dra Bárbara! Vim pelo site. Fiz o diagnóstico financeiro e meu resultado foi: ${resultado.titulo}. Gostaria de entender mais meu caso.`);
        const waLink = `https://wa.me/5561991427084?text=${waMsg}`;

        try {
            const formData = new FormData();
            formData.append('name', name);
            formData.append('email', email);
            formData.append('whatsapp', whatsapp);
            formData.append('assunto', ehLeadQuente ? '[LEAD QUENTE] Diagnóstico do Quiz' : 'Diagnóstico do Quiz');
            formData.append('resultado', resultado.titulo);
            formData.append('Pergunta_1_Tem_Dividas', quizState.q1 || 'Não respondido');
            formData.append('Pergunta_2_Vinculo', quizState.q2 || 'Não respondido');
            formData.append('Pergunta_3_Comprometimento', quizState.q3 || 'Não respondido');
            formData.append('Pergunta_4_Valor_Aproximado', quizState.q4 || 'Não respondido');
            formData.append('Pergunta_5_Situacoes_Sofridas', quizState.q5.length > 0 ? quizState.q5.join(', ') : 'Nenhuma');
            
            fetch('https://formsubmit.co/ajax/barbarasena.advocacia@gmail.com', {
                method: 'POST',
                body: formData,
                headers: { 'Accept': 'application/json' }
            }).catch(e => console.log('Silencioso: ', e));

        } catch (err) {}

        // Esconder o form e revelar o resultado
        setTimeout(() => {
            captureSection.style.display = 'none';
            resultSection.style.display = 'block';
            resultSection.classList.add('visible');
            
            // Scroll para topo do resultSection no mobile
            const quizContainer = document.querySelector('.quiz-container');
            if (quizContainer) {
                window.scrollTo({
                    top: quizContainer.getBoundingClientRect().top + window.scrollY - 120,
                    behavior: 'smooth'
                });
            }
        }, 800);

        // Bind do WhatsApp no resultado
        btnWhatsapp.addEventListener('click', () => {
            window.open(waLink, '_blank');
        });
    });
}

// Logic para calcular Risco (Baseado no PDF)
function verificarLeadQuente() {
    return (quizState.q4 === 'acima1m' || quizState.q3 === 'mais50');
}

function calcularResultado() {
    const s = quizState;

    // RESULTADO 5: Sem Risco (Verde, Sem Ícone)
    if (s.q1 === 'nao' || (s.q5 && s.q5.includes('nenhuma') && !s.q2)) {
        return {
            titulo: 'No momento, você não apresenta um cenário de risco relevante.',
            descricao: 'Ainda assim, uma boa estruturação contratual e financeira é fundamental para evitar problemas futuros.',
            icone: '', // Sem ícone
            classeDeRisco: 'risco-verde',
            botaoTexto: 'Quero estruturar melhor minha empresa'
        };
    }

    // RESULTADO 1: Alto Risco (Vermelho, Sem Ícone)
    if (s.q5 && (s.q5.includes('acao') || s.q5.includes('bloqueio') || s.q5.includes('busca'))) {
        return {
            titulo: 'Seu caso já apresenta risco jurídico imediato.',
            descricao: 'Medidas como bloqueios, execuções ou apreensões indicam que o banco já iniciou ações para recuperação do crédito. Nesse estágio, a atuação precisa ser rápida e estratégica para conter danos e proteger o patrimônio.',
            icone: '', // Sem ícone
            classeDeRisco: 'risco-vermelho',
            botaoTexto: 'Preciso de atuação imediata'
        };
    }

    // RESULTADO 2: Caixa Estrangulado (Preto, Sem Ícone)
    if ((s.q2 === 'cnpj' || s.q2 === 'ambos') && (s.q3 === '30a50' || s.q3 === 'mais50')) {
        return {
            titulo: 'Seu cenário indica pressão relevante no caixa.',
            descricao: 'Mesmo sem inadimplência, o comprometimento do fluxo financeiro reduz margem, limita crescimento e aumenta o risco de medidas por parte dos bancos. A reorganização do passivo bancário permite recuperar previsibilidade e evitar o agravamento da situação.',
            icone: '', // Sem ícone
            classeDeRisco: 'risco-preto',
            botaoTexto: 'Quero reorganizar meu passivo'
        };
    }

    // RESULTADO 3: Superendividamento (Preto, Sem Ícone)
    if (s.q2 === 'cpf' && (s.q3 === 'mais50' || s.q3 === '30a50')) {
        return {
            titulo: 'Seu caso apresenta indícios de superendividamento.',
            descricao: 'Quando as dívidas comprometem grande parte da renda, a tendência é de perda progressiva de controle financeiro. Sem uma reestruturação adequada, o cenário costuma evoluir para inadimplência, restrições e ações judiciais.',
            icone: '', // Sem ícone
            classeDeRisco: 'risco-preto',
            botaoTexto: 'Quero analisar meu caso'
        };
    }

    // RESULTADO 4: Risco Estrutural Controlado (Preto, Sem Ícone)
    // Tudo que sobrou (ex: dividas leves, menos de 30% sem ações ativas)
    return {
        titulo: 'Sua situação ainda está sob controle, mas exige atenção.',
        descricao: 'Dívidas mal estruturadas tendem a crescer e comprometer o caixa ao longo do tempo. Uma análise preventiva pode evitar que o problema evolua para um cenário mais crítico.',
        icone: '', // Sem ícone
        classeDeRisco: 'risco-preto',
        botaoTexto: 'Quero prevenir riscos'
    };
}