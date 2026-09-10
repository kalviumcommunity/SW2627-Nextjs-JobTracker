export default function AboutPage() {
  return (
    <div className="space-y-4">
      <h1 className="text-3xl font-bold text-gray-900">About Us</h1>
      <p className="text-gray-600 leading-relaxed">
        Learn more about our team and mission. This route is physically organized at app/(marketing)/about/page.tsx and resolves to /about without &quot;(marketing)&quot; leaking into the URL.
      </p>
    </div>
  );
}
