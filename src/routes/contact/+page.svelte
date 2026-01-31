<svelte:head>
	<title>Work With Me - Alex Sheppert</title>
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
				<li><a href="/#hero" class="nav-link scrollto"><i class="bx bx-home"></i> <span>Home</span></a></li>
				<li><a href="/#about" class="nav-link scrollto"><i class="bx bx-user"></i> <span>About</span></a></li>
				<li><a href="/blog" class="nav-link"><i class="bx bx-book"></i> <span>Blog</span></a></li>
				<li><a href="/resume" class="nav-link"><i class="bx bx-file-blank"></i> <span>Resume</span></a></li>
				<li><a href="/contact" class="nav-link active"><i class="bx bx-envelope"></i> <span>Work With Me</span></a></li>
			</ul>
		</nav>
	</div>
</header>

<main id="main">

	<!-- ======= Breadcrumbs ======= -->
	<section class="breadcrumbs">
		<div class="container">
			<div class="d-flex justify-content-between align-items-center">
				<h2>Work With Me</h2>
				<ol>
					<li><a href="/">Home</a></li>
					<li>Contact</li>
				</ol>
			</div>
		</div>
	</section>

	<!-- ======= Case Study Section (MOVED TO TOP) ======= -->
	<section id="case-study" class="case-study">
		<div class="container">

			<div class="section-title">
				<h2>What I've Built</h2>
				<p>A look at Matic Inside, the clinical AI company I founded.</p>
			</div>

			<div class="case-study-content" data-aos="fade-up">
				<div class="case-study-header">
					<h3>Matic Inside</h3>
					<span class="case-study-tag">Healthcare AI / Clinical Documentation</span>
				</div>

				<div class="case-study-body">
					<div class="case-study-problem">
						<h4>The Problem</h4>
						<p>Physicians spend 2+ hours per day on documentation, time that should go to patients. Existing solutions were clunky, inaccurate, or didn't fit into clinical workflows.</p>
					</div>

					<div class="case-study-solution">
						<h4>What We Built</h4>
						<p>Matic Inside is a suite of AI-powered tools for clinicians:</p>
						<ul class="product-list">
							<li><strong>ScribeMatic:</strong> Listens to patient encounters and generates clinical notes in real-time. I wrote the initial AI code, designed the clinical workflow integration, raised capital, and built the engineering team.</li>
							<li><strong>CodeMatic:</strong> Handles medical coding and billing accurately with artificial intelligence, reducing errors and speeding up reimbursement.</li>
							<li><strong>SumMatic:</strong> Summarizes all patient information from the EHR, giving physicians a quick overview before walking into the room.</li>
						</ul>
					</div>

					<div class="case-study-results">
						<h4>Results</h4>
						<div class="case-study-stats">
							<div class="stat">
								<span class="stat-number">Thousands</span>
								<span class="stat-label">of clinicians using the platform</span>
							</div>
							<div class="stat">
								<span class="stat-number">50%+</span>
								<span class="stat-label">reduction in documentation time</span>
							</div>
							<div class="stat">
								<span class="stat-number">Scaled</span>
								<span class="stat-label">from prototype to production</span>
							</div>
						</div>
					</div>

					<div class="case-study-lessons">
						<h4>Key Lessons</h4>
						<ul>
							<li><strong>Clinical workflow is everything.</strong> The best AI is worthless if it doesn't fit into how physicians actually work.</li>
							<li><strong>Accuracy isn't enough.</strong> You need trust, explainability, and easy correction when the AI gets it wrong.</li>
							<li><strong>Start with a real problem.</strong> We built for a pain point clinicians actually have, not a technology looking for a use case.</li>
						</ul>
					</div>
				</div>

				<a href="https://maticinside.ai/" target="_blank" rel="noopener noreferrer" class="case-study-link">
					Visit Matic Inside <i class="bi bi-arrow-right"></i>
				</a>
			</div>

		</div>
	</section>

	<!-- ======= How I Can Help Section ======= -->
	<section id="how-i-help" class="contact-page section-bg">
		<div class="container">

			<div class="section-title">
				<h2>How I Can Help</h2>
				<p>Different ways we might work together, depending on what you're building.</p>
			</div>

			<div class="engagement-grid" data-aos="fade-up">

				<!-- Research & Academia FIRST -->
				<div class="engagement-card">
					<div class="engagement-card__icon">
						<i class="bi bi-journal-medical"></i>
					</div>
					<h3>For Research & Academia</h3>
					<p>Looking for collaboration on healthcare ML research, clinical validation studies, or interdisciplinary projects? I'm actively publishing and interested in meaningful research partnerships.</p>
					<ul>
						<li>ML generalization & robustness research</li>
						<li>Clinical validation study design</li>
						<li>Healthcare informatics collaboration</li>
						<li>PhD/graduate student mentorship</li>
					</ul>
				</div>

				<!-- Investors & Funds SECOND -->
				<div class="engagement-card">
					<div class="engagement-card__icon">
						<i class="bi bi-bank"></i>
					</div>
					<h3>For Investors & Funds</h3>
					<p>Evaluating healthcare AI investments? I can provide technical due diligence, clinical feasibility analysis, and help separate genuine innovation from hype.</p>
					<ul>
						<li>Technical due diligence</li>
						<li>Clinical feasibility assessment</li>
						<li>Market landscape analysis</li>
						<li>Portfolio company advisory</li>
					</ul>
				</div>

				<!-- Health Systems THIRD -->
				<div class="engagement-card">
					<div class="engagement-card__icon">
						<i class="bi bi-building"></i>
					</div>
					<h3>For Health Systems & Hospitals</h3>
					<p>Implementing clinical AI, optimizing documentation workflows, or building internal data/AI capabilities? I can help with strategy, vendor evaluation, and ensuring solutions actually fit clinical workflows.</p>
					<ul>
						<li>Clinical AI implementation roadmaps</li>
						<li>EHR optimization & interoperability</li>
						<li>Staff training on AI tools</li>
						<li>Workflow analysis & redesign</li>
					</ul>
				</div>

				<!-- Startups FOURTH -->
				<div class="engagement-card">
					<div class="engagement-card__icon">
						<i class="bi bi-cpu"></i>
					</div>
					<h3>For Healthcare AI Startups</h3>
					<p>Building a health tech product? I've been through it, from writing the first line of code to raising capital to scaling to thousands of users. I can help you avoid the mistakes I made.</p>
					<ul>
						<li>Product strategy & clinical validation</li>
						<li>Technical architecture review</li>
						<li>Go-to-market for clinical products</li>
						<li>Fundraising preparation</li>
					</ul>
				</div>

			</div>

		</div>
	</section>

	<!-- ======= Philosophy Section ======= -->
	<section id="philosophy" class="philosophy-section">
		<div class="container">

			<div class="section-title">
				<h2>Why I Build</h2>
				<p>The case for technology in medicine.</p>
			</div>

			<div class="philosophy-content" data-aos="fade-up">
				<blockquote>
					"The medical system is broken and technology will fix it."
				</blockquote>

				<p>The United States spends 18% of its GDP on healthcare, roughly $5.3 trillion per year, or about $15,000 per person. That's nearly double what other wealthy countries spend. Germany spends 12%. France spends 12%. Japan spends 11%. Switzerland, the second-highest spender, still comes in at $5,000 less per person than we do.</p>

				<p>And what do we get for it? Worse outcomes. US life expectancy is 78 years compared to 81+ in peer countries. Our maternal mortality rate is several times higher than most of Europe. We have higher rates of preventable deaths, unmanaged chronic disease, and medical errors.</p>

				<p>Yes, the US produces an outsized share of medical research and new drugs, and that matters. But people cannot afford healthcare. The average emergency room visit costs $2,700. A significant portion of Americans delay or skip care because of cost. The entire system is precarious, built on layers of bureaucracy, regulations stacked on regulations, billing codes, prior authorizations, and administrative overhead that serves no one.</p>

				<p>This system will eventually collapse under its own weight unless technology can make it more efficient. And it can. AI can eliminate hours of documentation. Automation can cut through administrative waste. Better data systems can catch errors before they happen. My focus is on building, using, and pioneering that technology.</p>
			</div>

		</div>
	</section>

	<!-- ======= Contact Section ======= -->
	<section id="contact-info" class="contact-page section-bg">
		<div class="container">

			<div class="section-title">
				<h2>Get in Touch</h2>
				<p>Reach out to start a conversation.</p>
			</div>

			<div class="row contact-card-grid" data-aos="fade-up">

				<div class="col-lg-6">
					<div class="contact-card">
						<div class="contact-card__icon">
							<i class="bi bi-envelope"></i>
						</div>
						<div class="contact-card__content">
							<h3>Email</h3>
							<p>For consulting, advisory, and partnership opportunities</p>
							<a href="mailto:admin@sheppertenterprises.com" class="contact-card__link contact-card__email">
								admin@sheppertenterprises.com
							</a>
						</div>
					</div>
				</div>

				<div class="col-lg-6">
					<div class="contact-card">
						<div class="contact-card__icon">
							<i class="bx bxl-twitter"></i>
						</div>
						<div class="contact-card__content">
							<h3>X / Twitter DM</h3>
							<p>For quick questions or to say hello</p>
							<a href="https://x.com/alexsheppert" target="_blank" rel="noopener noreferrer" class="contact-card__link">
								@alexsheppert
							</a>
						</div>
					</div>
				</div>

				<div class="col-lg-6">
					<div class="contact-card">
						<div class="contact-card__icon">
							<i class="bi bi-geo-alt"></i>
						</div>
						<div class="contact-card__content">
							<h3>Location</h3>
							<p>Based in the Pacific Northwest, available globally</p>
							<span class="contact-card__text">Vancouver, WA, USA</span>
						</div>
					</div>
				</div>

				<div class="col-lg-6">
					<div class="contact-card">
						<div class="contact-card__icon">
							<i class="bi bi-calendar-check"></i>
						</div>
						<div class="contact-card__content">
							<h3>Availability</h3>
							<p>Taking on select consulting and advisory engagements</p>
							<span class="contact-card__text">Limited availability during residency</span>
						</div>
					</div>
				</div>

			</div>

			<div class="contact-cta" data-aos="fade-up">
				<h3>Ready to Connect?</h3>
				<p>Tell me about what you're working on. I'm most helpful when I understand the specific problem you're trying to solve. DM me on X for a faster response.</p>
				<div class="contact-cta__buttons">
					<a href="mailto:admin@sheppertenterprises.com" class="contact-cta__button">
						<i class="bi bi-envelope"></i> Send Email
					</a>
					<a href="https://x.com/alexsheppert" target="_blank" rel="noopener noreferrer" class="contact-cta__button contact-cta__button--secondary">
						<i class="bx bxl-twitter"></i> DM on X
					</a>
				</div>
			</div>

			<div class="contact-social" data-aos="fade-up">
				<h4>Follow My Work</h4>
				<div class="contact-social__links">
					<a href="https://x.com/alexsheppert" target="_blank" rel="noopener noreferrer" class="contact-social__link">
						<i class="bx bxl-twitter"></i>
						<span>@alexsheppert</span>
					</a>
					<a href="https://www.linkedin.com/in/alex-sheppert" target="_blank" rel="noopener noreferrer" class="contact-social__link">
						<i class="bx bxl-linkedin"></i>
						<span>LinkedIn</span>
					</a>
					<a href="https://github.com/shep-analytics" target="_blank" rel="noopener noreferrer" class="contact-social__link">
						<i class="bx bxl-github"></i>
						<span>GitHub</span>
					</a>
				</div>
			</div>

		</div>
	</section>

</main>

<a href="#" class="back-to-top d-flex align-items-center justify-content-center"><i class="bi bi-arrow-up-short"></i></a>
