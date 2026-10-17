export default function Loading() {
  return (
    <main className="study-design scripture-loading-screen" aria-label="Loading Scripture">
      <header className="reader-topbar scripture-loading-topbar">
        <span className="loading-pill loading-book" />
        <span className="loading-pill loading-version" />
        <span className="loading-icon" />
        <span className="loading-icon" />
      </header>
      <div className="reader-progress"><i /></div>
      <div className="scripture-loading-body">
        <span className="loading-title" />
        <div className="loading-verse-lines">
          <span /><span /><span /><span /><span /><span />
        </div>
      </div>
    </main>
  );
}
