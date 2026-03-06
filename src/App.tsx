// styles loaded via public/globals.css in index.html

export default function App() {
  return (
    <div style={{ display:"flex", flexDirection:"column", height:"100vh", background:"#0a1628" }}>
      <iframe
        src="/tool.html"
        style={{ flex:1, border:"none", width:"100%", height:"100%" }}
        title="new-project"
      />
    </div>
  )
}