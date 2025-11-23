document.addEventListener('DOMContentLoaded', function () {
    // Initialize Lucide Icons
    lucide.createIcons();

    // Mouse Orb Animation
    const orb = document.getElementById('mouse-orb');
    if (orb) {
        document.addEventListener('mousemove', (e) => {
            const x = (e.clientX / window.innerWidth) * 100;
            const y = (e.clientY / window.innerHeight) * 100;
            orb.style.left = `${x}%`;
            orb.style.top = `${y}%`;
        });
    }

    // Ripple Effect
    document.addEventListener('click', (e) => {
        // Only create ripple if clicking on the login overlay
        if (document.getElementById('login-overlay').style.display !== 'none') {
            const ripple = document.createElement('div');
            ripple.className = 'absolute border-2 border-red-500 rounded-full animate-ripple pointer-events-none';
            ripple.style.width = '10px';
            ripple.style.height = '10px';
            ripple.style.left = `${e.clientX}px`;
            ripple.style.top = `${e.clientY}px`;
            document.body.appendChild(ripple);
            setTimeout(() => ripple.remove(), 2000);
        }
    });

    // ========== AUTHENTICATION ==========
    async function checkAuth() {
        const loginBtn = document.getElementById('login-btn');
        const passwordInput = document.getElementById('login-password');
        const loginMessage = document.getElementById('login-message');
        const loginOverlay = document.getElementById('login-overlay');
        const mainContent = document.getElementById('main-content');

        if (!passwordInput) return;

        const password = passwordInput.value;

        // Loading state
        const originalBtnContent = '<div class="absolute inset-0 bg-gradient-to-r from-red-600 via-orange-500 to-red-600 rounded-2xl blur group-hover:blur-md transition-all duration-500"></div><div class="relative bg-gradient-to-r from-red-600 via-orange-500 to-red-600 py-5 rounded-2xl font-black text-white text-lg tracking-wider flex items-center justify-center gap-3 transform group-hover:scale-[1.02] transition-transform duration-300"><i data-lucide="zap" class="w-6 h-6"></i> INITIALIZE LABORATORY <i data-lucide="code-2" class="w-6 h-6"></i></div>';

        // Simple loading UI update
        loginBtn.innerHTML = '<div class="relative bg-gray-900 py-5 rounded-2xl font-black text-white text-lg tracking-wider flex items-center justify-center gap-3"><i data-lucide="loader-2" class="w-6 h-6 animate-spin"></i> VERIFYING...</div>';
        lucide.createIcons();

        try {
            const response = await fetch('/api/verify-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ password: password })
            });

            const data = await response.json();

            if (data.success) {
                // Success
                loginBtn.innerHTML = '<div class="relative bg-green-600 py-5 rounded-2xl font-black text-white text-lg tracking-wider flex items-center justify-center gap-3"><i data-lucide="check" class="w-6 h-6"></i> ACCESS GRANTED</div>';
                lucide.createIcons();

                setTimeout(() => {
                    loginOverlay.style.transition = 'opacity 0.5s ease';
                    loginOverlay.style.opacity = '0';
                    setTimeout(() => {
                        loginOverlay.style.display = 'none';
                        mainContent.style.display = 'block';
                        lucide.createIcons(); // Re-init icons for main content
                    }, 500);
                }, 800);
            } else {
                // Error
                throw new Error('Invalid password');
            }
        } catch (error) {
            console.error('Login error:', error);
            loginMessage.textContent = 'ACCESS DENIED: INVALID KEY';
            loginBtn.innerHTML = '<div class="relative bg-red-900 py-5 rounded-2xl font-black text-white text-lg tracking-wider flex items-center justify-center gap-3"><i data-lucide="x" class="w-6 h-6"></i> RETRY</div>';
            lucide.createIcons();

            setTimeout(() => {
                loginBtn.innerHTML = originalBtnContent;
                lucide.createIcons();
                loginMessage.textContent = '';
            }, 2000);
        }
    }

    const loginBtn = document.getElementById('login-btn');
    if (loginBtn) {
        loginBtn.addEventListener('click', (e) => {
            e.preventDefault();
            checkAuth();
        });
    }

    const passwordInput = document.getElementById('login-password');
    if (passwordInput) {
        passwordInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                checkAuth();
            }
        });
    }

    // ========== STATE VARIABLES ==========
    let currentUILanguage = 'hi';
    let currentOutputLanguage = 'hi';
    let currentStrategy = 'zero-shot';

    // ========== TRANSLATIONS ==========
    const translations = {
        hi: {
            designations: ["AI Prompt Engineer", "LLM विशेषज्ञ", "प्रॉम्प्ट आर्किटेक्ट"],
            hero: {
                title: "हर रोज़ की मुश्किलें, अब आसान।",
                description: "Just type your message, get instant AI-powered solutions. यह टूल इसलिए बनाया गया है ताकि आप अपनी daily problems को AI की मदद से आसानी से solve कर सकें।"
            },
            labels: {
                topic: "आप किस problem के लिए AI की help चाहते हैं?",
                qrText: "मेरा ChatBot देखने के लिए स्कैन करें",
                mission: "हमारा मिशन",
                missionText: "यह टूल उन लोगों के लिए बनाया गया है जो AI technology को जटिल मानते हैं।",
                portfolio: "Portfolio देखें",
                generate: "Smart Prompt बनाएं",
                outputLang: "Output Language",
                tone: "Tone",
                builder: "Smart Prompt Builder",
                saved: "Saved Prompts",
                recTitle: "Recommended AI Tools"
            }
        },
        en: {
            designations: ["AI Prompt Engineer", "LLM Specialist", "Prompt Architect"],
            hero: {
                title: "Making Daily Challenges Easier.",
                description: "Just type your message, get instant AI-powered solutions. This tool is designed to help you solve your daily problems easily with AI."
            },
            labels: {
                topic: "What problem do you need AI help with?",
                qrText: "Scan to see my ChatBot",
                mission: "Our Mission",
                missionText: "This tool is designed for those who find AI technology complex.",
                portfolio: "View Portfolio",
                generate: "Generate Smart Prompt",
                outputLang: "Output Language",
                tone: "Tone",
                builder: "Smart Prompt Builder",
                saved: "Saved Prompts",
                recTitle: "Recommended AI Tools"
            }
        }
    };

    // ========== AI TOOL RECOMMENDATIONS ==========
    const toolRecommendations = {
        code: { best: 'ChatGPT-4', alt1: 'Claude 2', alt2: 'GitHub Copilot', desc: 'ChatGPT-4 excels at code generation, debugging, and explaining complex algorithms.' },
        creative: { best: 'Claude 2', alt1: 'ChatGPT-4', alt2: 'Bard', desc: 'Claude 2 is excellent for creative writing, storytelling, and long-form content.' },
        analysis: { best: 'ChatGPT-4', alt1: 'Claude 2', alt2: 'Perplexity', desc: 'ChatGPT-4 provides deep analytical capabilities with structured reasoning.' },
        research: { best: 'Perplexity', alt1: 'Bard', alt2: 'ChatGPT-4', desc: 'Perplexity specializes in research with real-time web search and citations.' },
        default: { best: 'ChatGPT-4', alt1: 'Claude 2', alt2: 'Bard', desc: 'ChatGPT-4 is versatile for general tasks with strong reasoning.' }
    };

    // ========== UTILITY FUNCTIONS ==========
    function detectPromptCategory(input) {
        const lowerInput = input.toLowerCase();
        if (lowerInput.match(/code|program|function|debug|algorithm|script/)) return 'code';
        if (lowerInput.match(/write|story|creative|poem|article|blog/)) return 'creative';
        if (lowerInput.match(/analyze|compare|evaluate|assess/)) return 'analysis';
        if (lowerInput.match(/research|find|search|information/)) return 'research';
        return 'default';
    }

    function updateToolRecommendations(input) {
        const category = detectPromptCategory(input);
        const rec = toolRecommendations[category];

        const bestTool = document.getElementById('best-tool-name');
        if (bestTool) bestTool.textContent = rec.best;

        const alt1 = document.getElementById('alt-tool-1');
        if (alt1) alt1.textContent = rec.alt1;

        const alt2 = document.getElementById('alt-tool-2');
        if (alt2) alt2.textContent = rec.alt2;

        const desc = document.getElementById('tool-description');
        if (desc) desc.textContent = rec.desc;
    }

    function calculateMetrics(prompt) {
        const words = prompt.split(' ');
        const uniqueWords = new Set(words.map(w => w.toLowerCase()));

        const semanticDensity = ((uniqueWords.size / words.length) * 100).toFixed(1);
        const contextRichness = (Math.min(words.length / 50, 1) * 100).toFixed(1);
        const instructionClarity = (prompt.match(/:|step|first|then|finally|guide|create|write/gi)?.length || 0) * 10;
        const constraintBalance = (prompt.match(/must|should|tone|format|style|length|limit|avoid|include/gi)?.length || 0) * 15;

        return {
            semanticDensity: Math.min(semanticDensity, 100),
            contextRichness: Math.min(contextRichness, 100),
            instructionClarity: Math.min(instructionClarity, 100),
            constraintBalance: Math.min(constraintBalance, 100)
        };
    }

    function updateAnalysis(prompt, strategy) {
        const metrics = calculateMetrics(prompt);

        // Update metric values
        const semDens = document.getElementById('semantic-density');
        if (semDens) semDens.textContent = metrics.semanticDensity;

        const ctxRich = document.getElementById('context-richness');
        if (ctxRich) ctxRich.textContent = metrics.contextRichness;

        const instrClar = document.getElementById('instruction-clarity');
        if (instrClar) instrClar.textContent = metrics.instructionClarity;

        const constrBal = document.getElementById('constraint-balance');
        if (constrBal) constrBal.textContent = metrics.constraintBalance;

        // Update effectiveness score bar
        const avgScore = (parseFloat(metrics.semanticDensity) + parseFloat(metrics.contextRichness) +
            parseFloat(metrics.instructionClarity) + parseFloat(metrics.constraintBalance)) / 4;

        const effScore = document.getElementById('effectiveness-score');
        if (effScore) effScore.style.width = `${avgScore}%`;

        // Update cognitive chart
        const strategyNames = {
            'zero-shot': 'Linear Thinking',
            'chain-of-thought': 'Sequential Processing',
            'few-shot': 'Pattern Recognition',
            'tree-of-thought': 'Divergent Thinking',
            'react': 'Cyclical Reasoning'
        };

        const cogChart = document.getElementById('cognitive-chart');
        if (cogChart) {
            cogChart.innerHTML = `
                <div style="display: flex; align-items: center; justify-content: center; height: 100%; flex-direction: column;">
                    <div style="font-size: 24px; margin-bottom: 10px;">🧠</div>
                    <div style="color: #fff; font-weight: bold;">${strategyNames[strategy] || 'Standard Processing'}</div>
                    <div style="color: #888; font-size: 12px; margin-top: 5px;">Cognitive Pattern Active</div>
                </div>
            `;
        }

        // Update evolution steps
        const evoSteps = document.getElementById('evolution-steps');
        if (evoSteps) {
            evoSteps.innerHTML = `
                <div style="padding: 10px;">
                    <div style="margin-bottom: 8px; color: #aaa;">Step 1: Input Analysis</div>
                    <div style="margin-bottom: 8px; color: #aaa;">Step 2: Strategy Selection (${strategy})</div>
                    <div style="margin-bottom: 8px; color: #aaa;">Step 3: Context Integration</div>
                    <div style="color: #22c55e;">Step 4: Optimization Complete</div>
                </div>
            `;
        }

        // Update heatmap
        const heatmap = document.getElementById('semantic-heatmap');
        if (heatmap) {
            // Generate a dummy heatmap grid
            let gridHTML = '<div style="display: grid; grid-template-columns: repeat(10, 1fr); gap: 2px;">';
            for (let i = 0; i < 50; i++) {
                const intensity = Math.random();
                const color = `rgba(229, 9, 20, ${intensity})`;
                gridHTML += `<div style="width: 100%; padding-top: 100%; background: ${color}; border-radius: 2px;"></div>`;
            }
            gridHTML += '</div>';
            heatmap.innerHTML = gridHTML;
        }
    }

    function updateUILanguage(lang) {
        const t = translations[lang];

        const heroTitle = document.getElementById('hero-title');
        if (heroTitle) heroTitle.textContent = t.hero.title;

        const heroDesc = document.getElementById('hero-description');
        if (heroDesc) heroDesc.textContent = t.hero.description;

        const topicLabel = document.getElementById('topic-label');
        if (topicLabel) topicLabel.textContent = t.labels.topic;

        const qrText = document.getElementById('qr-text');
        if (qrText) qrText.textContent = t.labels.qrText;

        const missionTitle = document.getElementById('mission-title');
        if (missionTitle) missionTitle.textContent = t.labels.mission;

        const missionText = document.getElementById('mission-description');
        if (missionText) missionText.textContent = t.labels.missionText;

        const portfolioBtn = document.getElementById('portfolio-link');
        if (portfolioBtn) portfolioBtn.textContent = t.labels.portfolio;

        const generateBtn = document.getElementById('generate-btn');
        if (generateBtn) generateBtn.textContent = t.labels.generate;

        const outLangLabel = document.getElementById('output-lang-label');
        if (outLangLabel) outLangLabel.textContent = t.labels.outputLang;

        const toneLabel = document.getElementById('tone-label');
        if (toneLabel) toneLabel.textContent = t.labels.tone;

        const builderTitle = document.getElementById('builder-title');
        if (builderTitle) builderTitle.textContent = t.labels.builder;

        const savedTitle = document.getElementById('saved-title');
        if (savedTitle) savedTitle.textContent = t.labels.saved;

        const recTitle = document.getElementById('rec-title');
        if (recTitle) recTitle.textContent = t.labels.recTitle;
    }

    // ========== FLASK BACKEND API CALL ==========
    async function callBackendAPI(input, strategy, tone, outputLang) {
        const response = await fetch('/api/generate', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                input: input,
                strategy: strategy,
                tone: tone,
                outputLang: outputLang
            })
        });

        const data = await response.json();

        if (response.ok && data.success) {
            return {
                success: true,
                prompt: data.prompt,
                tokens_used: data.tokens_used || { total_tokens: 0, prompt_tokens: 0, completion_tokens: 0 }
            };
        } else {
            return { success: false, fallback: true, error: data.error };
        }
    }

    // ========== DESIGNATION ROTATION ==========
    let designationIndex = 0;
    const designationEl = document.getElementById('creator-designation');
    if (designationEl) {
        setInterval(() => {
            designationEl.style.opacity = '0';
            setTimeout(() => {
                designationEl.textContent = translations[currentUILanguage].designations[designationIndex];
                designationEl.style.opacity = '1';
                designationIndex = (designationIndex + 1) % translations[currentUILanguage].designations.length;
            }, 500);
        }, 3000);
    }

    // ========== EVENT LISTENERS ==========

    // UI Language Switch
    document.querySelectorAll('.lang-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.lang-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentUILanguage = btn.dataset.lang;

            // Also set output language to match UI language by default
            currentOutputLanguage = currentUILanguage;
            updateUILanguage(currentUILanguage);

            // Update output language buttons too
            document.querySelectorAll('.lang-option').forEach(opt => {
                if (opt.dataset.lang === currentUILanguage) {
                    opt.classList.add('active');
                } else {
                    opt.classList.remove('active');
                }
            });
        });
    });

    // Output Language Switch
    const outputLangSelect = document.querySelector('.lang-toggle');
    if (outputLangSelect) {
        outputLangSelect.addEventListener('click', (e) => {
            if (!e.target.classList.contains('lang-option')) return;
            currentOutputLanguage = e.target.dataset.lang;
            document.querySelectorAll('.lang-option').forEach(opt => opt.classList.remove('active'));
            e.target.classList.add('active');
        });
    }

    // Strategy Selection
    document.querySelectorAll('.strategy-card').forEach(card => {
        card.addEventListener('click', () => {
            document.querySelectorAll('.strategy-card').forEach(c => c.classList.remove('active'));
            card.classList.add('active');
            currentStrategy = card.dataset.strategy;
        });
    });

    // Sliders
    const tempSlider = document.getElementById('temperature-slider');
    if (tempSlider) {
        tempSlider.addEventListener('input', (e) => {
            const valDisplay = document.getElementById('temp-value');
            if (valDisplay) valDisplay.textContent = e.target.value;
        });
    }

    const maxTokenSlider = document.getElementById('max-tokens-slider');
    if (maxTokenSlider) {
        maxTokenSlider.addEventListener('input', (e) => {
            const valDisplay = document.getElementById('max-tokens');
            if (valDisplay) valDisplay.textContent = e.target.value;
        });
    }

    // Token Optimization Buttons (Visual Only)
    document.querySelectorAll('.token-opt-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.token-opt-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
        });
    });

    // Generate Button
    const generateBtn = document.getElementById('generate-btn');
    if (generateBtn) {
        generateBtn.addEventListener('click', async () => {
            const input = document.getElementById('topic-input').value;
            const tone = document.getElementById('tone-select').value;

            if (!input) {
                alert('Please enter a topic!');
                return;
            }

            // Show loading state with animation
            const btn = document.getElementById('generate-btn');
            const originalText = btn.textContent;
            btn.disabled = true;

            // Animated loading text
            let dots = '';
            const loadingInterval = setInterval(() => {
                dots = dots.length >= 3 ? '' : dots + '.';
                btn.textContent = `🤖 Generating with Grok AI${dots}`;
            }, 300);

            try {
                // Update recommendations
                updateToolRecommendations(input);

                // Call Backend
                const result = await callBackendAPI(input, currentStrategy, tone, currentOutputLanguage);

                let generatedPrompt = "";
                if (result.success) {
                    generatedPrompt = result.prompt;

                    // Display actual token count from backend
                    if (result.tokens_used) {
                        const tokenEstimate = document.getElementById('token-estimate');
                        if (tokenEstimate) {
                            tokenEstimate.textContent = `~${result.tokens_used.total_tokens}`;
                            tokenEstimate.style.color = '#22c55e';
                        }
                    }
                } else {
                    generatedPrompt = `Error: ${result.error || 'Failed to generate prompt.'}`;
                }

                // Display Result
                const outText = document.getElementById('output-text');
                if (outText) outText.textContent = generatedPrompt;

                // Show output section
                const outputSection = document.getElementById('output-section');
                if (outputSection) outputSection.style.display = 'block';

                // Update Analysis
                updateAnalysis(generatedPrompt, currentStrategy);

            } catch (error) {
                console.error("Generation Error:", error);
                alert("An error occurred while generating the prompt.");
            } finally {
                clearInterval(loadingInterval);
                btn.textContent = originalText;
                btn.disabled = false;
            }
        });
    }

    // Copy Button
    const copyBtn = document.getElementById('copy-btn');
    if (copyBtn) {
        copyBtn.addEventListener('click', () => {
            const text = document.getElementById('output-text').textContent;
            navigator.clipboard.writeText(text).then(() => {
                copyBtn.textContent = '✅ Copied!';
                copyBtn.style.background = '#22c55e';
                setTimeout(() => {
                    copyBtn.textContent = 'Copy';
                    copyBtn.style.background = '#333';
                }, 2000);
            });
        });
    }

    // Initialize
    updateUILanguage('hi');
    console.log('✅ Ambuj Prompt Builder (Flask Backend) Initialized!');
});
