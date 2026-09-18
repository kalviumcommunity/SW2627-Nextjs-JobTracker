/**
 * Milestone 2.17: Default Server Component Behaviour
 * 
 * In Next.js App Router, all components are Server Components by default.
 * They run exclusively on the server, can be declared async, can directly access databases/APIs,
 * and their code NEVER ships to the client browser bundle.
 */

// ============================================================================
// TASK 1 & 3 (AFTER): Correct Server Component Pattern
// ============================================================================
// Notice: NO 'use client' directive.
// Declared with `async`, uses `await` directly, NO useState, NO useEffect.
interface Article {
  id: number;
  title: string;
  body: string;
}

export async function ArticlesPageGood() {
  // Direct data fetch on the server - no API layer or useEffect needed
  const response = await fetch('https://jsonplaceholder.typicode.com/posts');
  const articles: Article[] = await response.json();

  return (
    <main style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto' }}>
      <h1>Articles (Server Fetching)</h1>
      <div>
        {articles.slice(0, 5).map((article) => (
          <article
            key={article.id}
            style={{
              padding: '1rem',
              border: '1px solid #ddd',
              marginBottom: '1rem',
              borderRadius: '4px',
            }}
          >
            <h2>{article.title}</h2>
            <p>{article.body.substring(0, 100)}...</p>
          </article>
        ))}
      </div>
    </main>
  );
}

// ============================================================================
// TASK 3 (BEFORE): Old Client Component Anti-Pattern
// ============================================================================
// Notice: Requires 'use client', useState, useEffect, causes waterfall,
// bloats bundle size, and flashes a loading state.
'use client';

import { useEffect, useState } from 'react';

export function ArticlesPageBad() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);

  // Anti-pattern: Client-side useEffect fetch
  useEffect(() => {
    fetch('https://jsonplaceholder.typicode.com/posts')
      .then((res) => res.json())
      .then((data) => {
        setArticles(data.slice(0, 5));
        setLoading(false);
      });
  }, []);

  if (loading) return <p>Loading...</p>;

  return (
    <main>
      <h1>Articles (Client Fetching - Anti-pattern)</h1>
      {articles.map((article) => (
        <article key={article.id}>
          <h2>{article.title}</h2>
          <p>{article.body.substring(0, 100)}...</p>
        </article>
      ))}
    </main>
  );
}
