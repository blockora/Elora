export function App() {
  return (
    <main className="shell">
      <nav aria-label="Main navigation">
        <a className="brand" href="/">
          elora<span>.</span>
        </a>
        <span className="badge">FREE-FIRST WEBSITE BUILDER</span>
      </nav>
      <section className="intro">
        <p className="eyebrow">YOUR IDEA, BEAUTIFULLY BUILT</p>
        <h1>
          What would you
          <br />
          like to <em>create?</em>
        </h1>
        <p className="description">
          Describe your website. Elora will help bring it to life.
        </p>
        <form onSubmit={(event) => event.preventDefault()}>
          <label htmlFor="prompt">Describe your website</label>
          <textarea
            id="prompt"
            rows={4}
            placeholder="A warm, modern restaurant website with a seasonal menu…"
          />
          <button type="submit">
            Start creating <span aria-hidden="true">↗</span>
          </button>
        </form>
        <p className="note">
          A first look at Elora. Website generation is not connected yet.
        </p>
      </section>
      <footer>
        Make something you love. <span>Elora 2026</span>
      </footer>
    </main>
  )
}
