'use client';

export default function TermsPage() {
    return (
        <div style={{ minHeight: '100vh', background: '#0a0a0f', color: 'white', padding: '4rem 2rem' }}>
            <div style={{ maxWidth: '800px', margin: '0 auto' }}>
                <h1 style={{ fontSize: '2.5rem', fontWeight: 800, marginBottom: '0.5rem' }}>Terms of Service</h1>
                <p style={{ color: '#71717a', marginBottom: '3rem' }}>Last updated: March 23, 2026</p>

                <div style={{ color: '#a1a1aa', lineHeight: 1.8 }}>
                    <section style={{ marginBottom: '2rem' }}>
                        <h2 style={{ color: 'white', fontSize: '1.5rem', fontWeight: 600, marginBottom: '1rem' }}>1. Acceptance of Terms</h2>
                        <p>By accessing or using Valueskins ("the Platform"), you agree to be bound by these Terms of Service. If you do not agree to all terms, you may not use the Platform.</p>
                    </section>

                    <section style={{ marginBottom: '2rem' }}>
                        <h2 style={{ color: 'white', fontSize: '1.5rem', fontWeight: 600, marginBottom: '1rem' }}>2. Description of Service</h2>
                        <p>Valueskins provides a platform for creators to build and verify their professional reputation, connect with brands, and receive compensation for opportunities. The Platform includes:</p>
                        <ul style={{ marginTop: '1rem', paddingLeft: '1.5rem' }}>
                            <li>Reputation scoring and level system</li>
                            <li>Brand marketplace for opportunities</li>
                            <li>Referral and rewards system</li>
                            <li>API access for third-party integrations</li>
                        </ul>
                    </section>

                    <section style={{ marginBottom: '2rem' }}>
                        <h2 style={{ color: 'white', fontSize: '1.5rem', fontWeight: 600, marginBottom: '1rem' }}>3. User Accounts</h2>
                        <p>You are responsible for maintaining the security of your account and wallet connection. You must not share your credentials or transfer your account to another person.</p>
                    </section>

                    <section style={{ marginBottom: '2rem' }}>
                        <h2 style={{ color: 'white', fontSize: '1.5rem', fontWeight: 600, marginBottom: '1rem' }}>4. Fees and Payments</h2>
                        <p>Valueskins charges a 5% platform fee on completed deals facilitated through the marketplace. Payments are processed through smart contracts and are final once confirmed on-chain.</p>
                    </section>

                    <section style={{ marginBottom: '2rem' }}>
                        <h2 style={{ color: 'white', fontSize: '1.5rem', fontWeight: 600, marginBottom: '1rem' }}>5. Creator Qualifications and Content Disclaimers</h2>
                        <p style={{ marginBottom: '1rem' }}>Valueskins does not conduct formal background checks or verify professional qualifications. A creator's published content serves as their qualification portfolio.</p>
                        <p style={{ marginBottom: '1rem' }}>For content related to regulated or sensitive topics (healthcare, skincare recommendations, legal advice, financial advice, nutrition, fitness, mental health, etc.), creators <strong>must include clear disclaimers</strong> that the content represents:</p>
                        <ul style={{ marginTop: '1rem', paddingLeft: '1.5rem', marginBottom: '1rem' }}>
                            <li>Personal opinion, experience, or interpretation—not professional advice</li>
                            <li>Advice from a qualified professional (e.g., "my dermatologist recommended..." or "according to my lawyer...")</li>
                            <li>Information specific to their circumstances (e.g., "for my skin type" or "based on my health condition")</li>
                            <li>A disclaimer that viewers should consult with qualified professionals before acting on the content</li>
                        </ul>
                        <p style={{ marginBottom: '1rem' }}>Examples of appropriate disclaimers:</p>
                        <ul style={{ marginTop: '1rem', paddingLeft: '1.5rem', marginBottom: '1rem' }}>
                            <li><em>"This skincare routine works for my combination skin type. Consult a dermatologist before changing your routine."</em></li>
                            <li><em>"This is my personal interpretation. I'm not a lawyer—consult a legal professional for actual advice."</em></li>
                            <li><em>"Based on advice from my nutritionist. Individual results vary; consult a registered dietitian for personalized guidance."</em></li>
                        </ul>
                        <p>Brands should not work with creators who present unqualified content as professional advice. Violating this policy may result in account suspension or removal from the Platform.</p>
                    </section>

                    <section style={{ marginBottom: '2rem' }}>
                        <h2 style={{ color: 'white', fontSize: '1.5rem', fontWeight: 600, marginBottom: '1rem' }}>6. Prohibited Conduct</h2>
                        <p>You agree not to:</p>
                        <ul style={{ marginTop: '1rem', paddingLeft: '1.5rem' }}>
                            <li>Manipulate or falsify your reputation score</li>
                            <li>Create multiple accounts to game the referral system</li>
                            <li>Engage in fraudulent or deceptive practices</li>
                            <li>Present unqualified personal opinions as professional or expert advice (especially for healthcare, legal, financial, or other regulated topics)</li>
                            <li>Violate any applicable laws or regulations</li>
                        </ul>
                    </section>

                    <section style={{ marginBottom: '2rem' }}>
                        <h2 style={{ color: 'white', fontSize: '1.5rem', fontWeight: 600, marginBottom: '1rem' }}>7. Intellectual Property</h2>
                        <p>You retain ownership of your content. By using the Platform, you grant Valueskins a license to display your profile information for the purpose of facilitating connections with brands.</p>
                    </section>

                    <section style={{ marginBottom: '2rem' }}>
                        <h2 style={{ color: 'white', fontSize: '1.5rem', fontWeight: 600, marginBottom: '1rem' }}>8. Dispute Resolution</h2>
                        <p>Disputes between creators and brands will first attempt to be resolved through the Platform's dispute resolution process. Unresolved disputes may be subject to binding arbitration.</p>
                    </section>

                    <section style={{ marginBottom: '2rem' }}>
                        <h2 style={{ color: 'white', fontSize: '1.5rem', fontWeight: 600, marginBottom: '1rem' }}>9. Limitation of Liability</h2>
                        <p>Valueskins is provided "as is" without warranties of any kind. We are not liable for any indirect, incidental, or consequential damages arising from your use of the Platform.</p>
                    </section>

                    <section style={{ marginBottom: '2rem' }}>
                        <h2 style={{ color: 'white', fontSize: '1.5rem', fontWeight: 600, marginBottom: '1rem' }}>10. Changes to Terms</h2>
                        <p>We may update these terms from time to time. Continued use of the Platform after changes constitutes acceptance of the new terms.</p>
                    </section>

                    <section>
                        <h2 style={{ color: 'white', fontSize: '1.5rem', fontWeight: 600, marginBottom: '1rem' }}>11. Contact</h2>
                        <p>For questions about these Terms, contact us at legal@valueskins.io</p>
                    </section>
                </div>
            </div>
        </div>
    );
}
