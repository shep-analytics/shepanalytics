<script>
	import { onMount, onDestroy } from 'svelte';

	let typedInstance = null;
	let typedInitTimer = null;
	let typedResizeObserver = null;
	let typedResizeHandler = null;

	onMount(() => {
		// Initialize Typed.js for the hero section
		const typedElement = document.querySelector('.typed');
		if (typedElement) {
			const typedWrapper = typedElement.closest('.typed-wrapper') || typedElement;
			const typedStrings = (typedElement.getAttribute('data-typed-items') || '')
				.split(',')
				.map((text) => text.trim())
				.filter(Boolean);

			const prefersReducedMotion = window.matchMedia &&
				window.matchMedia('(prefers-reduced-motion: reduce)').matches;

			const applyStableWidth = () => {
				if (!typedElement.isConnected) {
					return;
				}

				const measure = document.createElement('span');
				const styles = window.getComputedStyle(typedElement);
				measure.style.position = 'absolute';
				measure.style.visibility = 'hidden';
				measure.style.whiteSpace = 'nowrap';
				measure.style.fontFamily = styles.fontFamily;
				measure.style.fontSize = styles.fontSize;
				measure.style.fontWeight = styles.fontWeight;
				measure.style.fontStyle = styles.fontStyle;
				measure.style.letterSpacing = styles.letterSpacing;
				measure.style.textTransform = styles.textTransform;
				measure.style.lineHeight = styles.lineHeight;
				document.body.appendChild(measure);

				let maxWidth = 0;
				typedStrings.forEach((text) => {
					measure.textContent = text;
					const width = measure.getBoundingClientRect().width;
					if (width > maxWidth) {
						maxWidth = width;
					}
				});

				measure.remove();
				if (maxWidth > 0) {
					typedWrapper.style.setProperty('--typed-min-width', `${Math.ceil(maxWidth)}px`);
				}
			};

			const startTyped = () => {
				if (typeof window.Typed === 'undefined') {
					return false;
				}

				if (typedInstance) {
					typedInstance.destroy();
				}

				typedInstance = new window.Typed(typedElement, {
					strings: typedStrings,
					loop: true,
					typeSpeed: 90,
					backSpeed: 45,
					backDelay: 1800,
					startDelay: 200,
					smartBackspace: true,
					showCursor: true
				});

				return true;
			};

			const scheduleTypedInit = () => {
				if (startTyped()) {
					return;
				}

				let attempts = 0;
				typedInitTimer = window.setInterval(() => {
					attempts += 1;
					if (startTyped() || attempts > 80) {
						window.clearInterval(typedInitTimer);
						typedInitTimer = null;
					}
				}, 50);
			};

			const initializeTyped = () => {
				if (typedStrings.length === 0) {
					return;
				}

				if (prefersReducedMotion) {
					typedElement.textContent = typedStrings[0];
					return;
				}

				applyStableWidth();
				scheduleTypedInit();

				if (window.ResizeObserver) {
					typedResizeObserver = new ResizeObserver(() => applyStableWidth());
					typedResizeObserver.observe(typedElement);
				} else {
					typedResizeHandler = () => applyStableWidth();
					window.addEventListener('resize', typedResizeHandler);
				}
			};

			if (document.fonts && document.fonts.ready) {
				document.fonts.ready.then(initializeTyped).catch(initializeTyped);
			} else {
				initializeTyped();
			}
		}

		// Reinitialize AOS for this page
		if (typeof AOS !== 'undefined') {
			AOS.refresh();
		}
	});

	onDestroy(() => {
		// Clean up Typed.js instance
		if (typedInitTimer) {
			window.clearInterval(typedInitTimer);
			typedInitTimer = null;
		}

		if (typedResizeObserver) {
			typedResizeObserver.disconnect();
			typedResizeObserver = null;
		}

		if (typedResizeHandler) {
			window.removeEventListener('resize', typedResizeHandler);
			typedResizeHandler = null;
		}

		if (typedInstance) {
			typedInstance.destroy();
			typedInstance = null;
		}
	});
</script>

<svelte:head>
	<title>Alex Sheppert - DO, PhD, MBA</title>
</svelte:head>

<!-- ======= Header ======= -->
  <header id="header">
    <div class="d-flex flex-column">

      <div class="profile">
        <img src="/assets/img/headshot.png" alt="" class="img-fluid rounded-circle">
        <h1 class="text-light"><a href="/">Alex Sheppert, DO, PhD, MBA</a></h1>
        <div class="social-links mt-3 text-center">
          <a href="https://x.com/alexsheppert" class="twitter"><i class="bx bxl-twitter"></i></a>
          <a href="https://www.linkedin.com/in/alex-sheppert" class="linkedin"><i class="bx bxl-linkedin"></i></a>
          <a href="https://github.com/shep-analytics" class="github"><i class="bx bxl-github"></i></a>
        </div>
      </div>

      <nav id="navbar" class="nav-menu navbar">
        <ul>
          <li><a href="#hero" class="nav-link scrollto active"><i class="bx bx-home"></i> <span>Home</span></a></li>
          <li><a href="#about" class="nav-link scrollto"><i class="bx bx-user"></i> <span>About</span></a></li>
          <li><a href="/blog" class="nav-link"><i class="bx bx-book"></i> <span>Blog</span></a></li>
          <li><a href="/resume" class="nav-link"><i class="bx bx-file-blank"></i> <span>Resume</span></a></li>
          <!-- <li><a href="#portfolio" class="nav-link scrollto"><i class="bx bx-book-content"></i> <span>Portfolio</span></a></li> -->
          <li><a href="/contact" class="nav-link"><i class="bx bx-envelope"></i> <span>Work With Me</span></a></li>
        </ul>
      </nav><!-- .nav-menu -->
    </div>
  </header><!-- End Header -->

  <!-- ======= Hero Section ======= -->
  <section id="hero" class="d-flex flex-column justify-content-center align-items-center">
    <div class="hero-container" data-aos="fade-in">
      <h1>Alex Sheppert, DO, PhD, MBA</h1>
      <p>I'm a <span class="typed-wrapper"><span class="typed"
          data-typed-items="Physician building AI for healthcare, Clinical AI researcher, Healthcare technology founder, Physician-engineer"></span></span>
      </p>
    </div>
    <div class="hero-actions">
      <a href="/blog" class="hero-button">blog</a>
      <a href="/resume" class="hero-button">resume</a>
      <a href="/contact" class="hero-button">work with me</a>
      <a href="/patients" class="hero-button">for current patients</a>
    </div>
  </section><!-- End Hero -->

  <main id="main">

    <!-- ======= About Section ======= -->
    <section id="about" class="about">
      <div class="container">

        <div class="section-title">
          <h2>About</h2>
          <p>Physician-engineer building AI systems that solve real clinical problems.</p>
        </div>

        <div class="row">
          <div class="col-lg-4" data-aos="fade-right">
            <img src="/assets/img/headshot.png" class="img-fluid" alt="">
          </div>
          <div class="col-lg-8 pt-4 pt-lg-0 content" data-aos="fade-left">
            <h3>Physician-Engineer</h3>
            <p class="fst-italic">
              Most AI in healthcare fails because it's built by people who don't understand clinical reality. Most healthcare innovation fails because it's designed by people who don't understand AI. I'm working to fix that.
            </p>
            <div class="row">
              <div class="col-lg-6">
                <ul>
                  <li><i class="bi bi-chevron-right"></i> <strong>Credentials:</strong> <span>DO, PhD (AI), MBA</span></li>
                  <li><i class="bi bi-chevron-right"></i> <strong>Location:</strong> <span>Vancouver, WA</span></li>
                  <li><i class="bi bi-chevron-right"></i> <strong>Specialty:</strong> <span>Internal Medicine</span></li>
                </ul>
              </div>
              <div class="col-lg-6">
                <ul>
                  <li><i class="bi bi-chevron-right"></i> <strong>Focus:</strong> <span>Clinical AI Systems</span></li>
                  <li><i class="bi bi-chevron-right"></i> <strong>Research:</strong> <span>ML Generalization</span></li>
                  <li><i class="bi bi-chevron-right"></i> <strong>Member:</strong> <span><a href="https://councils.forbes.com/profile/Alexander-Sheppert-Founder-CTO-Resident-Internal-Medicine-Physician-Matic/7a750b68-cbe0-4865-b09a-84f88eb026cd">Forbes Tech Council</a></span></li>
                </ul>
              </div>
            </div>
            <p>
              I completed my DO and PhD simultaneously while building <a href="https://maticinside.ai/">Matic Inside</a>, a clinical AI company now helping thousands of physicians reduce documentation burden. My research focuses on optimizing machine learning models and helping them generalize to clinical settings.
            </p>
            <p>
              <strong>Currently:</strong> Internal Medicine resident at Salmon Creek, researching machine learning robustness in clinical applications, and advising healthcare AI startups from a technical standpoint.
            </p>
          </div>
        </div>

      </div>
    </section><!-- End About Section -->



    <!-- ======= Blog Section ======= -->
    <section id="blog" class="blog section-bg">
      <div class="container">

        <div class="section-title">
          <h2>Blog</h2>
          <p>Short reads on clinical informatics, AI research, and building real-world products.</p>
        </div>

        <div class="row">
          <div class="col-lg-4 col-md-6 d-flex align-items-stretch" data-aos="fade-up">
            <a href="https://x.com/alexsheppert/status/1930432235183780202" target="_blank" rel="noopener noreferrer" class="blog-card-link">
              <article class="blog-card">
                <div class="blog-card__meta">
                  <span class="blog-card__tag">Psychology</span>
                  <span class="blog-card__date">Jun 4, 2025</span>
                </div>
                <h3>IQ is not a Very Good Measure of Extreme Intelligence</h3>
                <p>Why IQ tests fail to capture high-end ability and overstate what they measure at the extremes.</p>
                <span class="blog-card__link">Read on X -></span>
              </article>
            </a>
          </div>
          <div class="col-lg-4 col-md-6 d-flex align-items-stretch" data-aos="fade-up" data-aos-delay="100">
            <a href="https://x.com/alexsheppert/status/1944538619924070721" target="_blank" rel="noopener noreferrer" class="blog-card-link">
              <article class="blog-card">
                <div class="blog-card__meta">
                  <span class="blog-card__tag">AI Philosophy</span>
                  <span class="blog-card__date">Jul 13, 2025</span>
                </div>
                <h3>On Artificial Intelligence and Sentience</h3>
                <p>Where consciousness and sentience might diverge in AI, and why the distinction matters.</p>
                <span class="blog-card__link">Read on X -></span>
              </article>
            </a>
          </div>
          <div class="col-lg-4 col-md-6 d-flex align-items-stretch" data-aos="fade-up" data-aos-delay="200">
            <a href="https://x.com/alexsheppert/status/1951012784139010223" target="_blank" rel="noopener noreferrer" class="blog-card-link">
              <article class="blog-card">
                <div class="blog-card__meta">
                  <span class="blog-card__tag">Healthcare AI</span>
                  <span class="blog-card__date">Jul 31, 2025</span>
                </div>
                <h3>The Silent AI Arms Race Between Insurance Companies and Doctors</h3>
                <p>How AI is being deployed by insurers and clinicians around documentation, coding, and reimbursement.</p>
                <span class="blog-card__link">Read on X -></span>
              </article>
            </a>
          </div>
        </div>

        <div class="text-center mt-4" data-aos="fade-up" data-aos-delay="300">
          <a href="/blog" class="blog-view-all">View all writings <i class="bi bi-arrow-right"></i></a>
        </div>

      </div>
    </section><!-- End Blog Section -->

  </main><!-- End #main -->



  <a href="#header" class="back-to-top d-flex align-items-center justify-content-center"><i
      class="bi bi-arrow-up-short"></i></a>
