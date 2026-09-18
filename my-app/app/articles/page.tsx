interface Article {
  id: number;
  title: string;
  body: string;
}

// This is a Server Component - no 'use client' directive
export default async function ArticlesPage() {
  // Direct async data fetching on the server without client hooks or useEffect
  const articles: Article[] = await fetch('https://jsonplaceholder.typicode.com/posts').then(
    (res) => res.json()
  );

  return (
    <main style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto' }}>
      <h1 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '1.5rem' }}>Articles</h1>
      <div>
        {articles.slice(0, 5).map((article) => (
          <article
            key={article.id}
            style={{
              padding: '1rem',
              border: '1px solid #ddd',
              marginBottom: '1rem',
              borderRadius: '6px',
              backgroundColor: '#ffffff',
            }}
          >
            <h2 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '0.5rem' }}>
              {article.title}
            </h2>
            <p style={{ color: '#4b5563', lineHeight: '1.6' }}>
              {article.body.substring(0, 100)}...
            </p>
          </article>
        ))}
      </div>
    </main>
  );
}
