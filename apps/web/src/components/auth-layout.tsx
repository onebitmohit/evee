import { Brand } from "@/components/brand";

function PixelCharacter() {
  return (
    <div aria-hidden="true" className="auth-character-stage">
      <div className="auth-character-runner">
        <div className="auth-character-facing">
          <div className="auth-character-gait">
            <span className="auth-character-sprite" />
          </div>
        </div>
      </div>
    </div>
  );
}

export function AuthLayout({ title, subtitle, children }: { title: string; subtitle: string; children: React.ReactNode }) {
  return (
    <main className="auth-page-shell">
      <section className="auth-story-panel">
        <div className="auth-story-head">
          <Brand />
          <p>GTM signal workspace</p>
        </div>

        <div className="auth-story-content">
          <div className="auth-story-copy">
            <p className="auth-kicker">Find the signal in the noise</p>
            <h1>Conversations worth acting on.</h1>
            <p>Monitor public demand, review evidence, and keep every outbound response human-approved.</p>
          </div>
          <PixelCharacter />
        </div>

        <p className="auth-story-footer">Evee never posts on your behalf.</p>
      </section>

      <section className="auth-entry-panel">
        <div className="auth-entry-topline">
          <span>Workspace access</span>
          <span className="auth-status-mark" aria-hidden="true">[ ready ]</span>
        </div>
        <div className="auth-entry-content">
          <div className="lg:hidden"><Brand /></div>
          <p className="auth-kicker">Secure sign-in</p>
          <h2>{title}</h2>
          <p className="auth-entry-subtitle">{subtitle}</p>
          {children}
        </div>
      </section>
    </main>
  );
}
