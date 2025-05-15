import HeartHero from "../components/illustrations/HeartHero";

function Home() {
  return (
<div className="page-background" style={{ minHeight: "100vh", padding: "60px 20px" }}>
      <div className="page-container text-center">
        <HeartHero />
        <h1>Welcome to CardioCare</h1>
        <p className="mt-4 mx-auto max-w-xl">
          Use artificial intelligence to check your heart health risk. Safe. Simple. For everyone.
        </p>
      </div>
    </div>
  );
}

export default Home;
