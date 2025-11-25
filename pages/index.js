import {useState, useEffect} from 'react'
import { MapPin, Star, Wrench, User, Users } from 'lucide-react'

export default function Home(){
  const [role,setRole]=useState('user')
  const [craftsmen,setCraftsmen]=useState([])
  const [bookings,setBookings]=useState([])
  const [search,setSearch]=useState('')
  const [selected,setSelected]=useState(null)

  useEffect(()=>{ fetch('/api/craftsmen').then(r=>r.json()).then(d=>setCraftsmen(d)) },[])
  useEffect(()=>{ fetch('/api/bookings').then(r=>r.json()).then(d=>setBookings(d)) },[])

  async function bookCraftsman(c){
    const res = await fetch('/api/bookings',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({craftId:c.id,craftName:c.name,user:'مستخدم تجريبي'})})
    const nb = await res.json()
    setBookings(b=>[nb,...b])
    alert('تم إرسال طلب الحجز إلى '+c.name)
  }

  async function removeCraftsman(id){
    if(!confirm('هل تريد حذف الحرفي؟')) return
    await fetch('/api/craftsmen',{method:'DELETE',headers:{'content-type':'application/json'},body:JSON.stringify({id})})
    setCraftsmen(c=>c.filter(x=>x.id!==id))
  }

  const filtered = craftsmen.filter(c=> c.name.includes(search) || c.job.includes(search))

  return <div className="container">
    <header className="header">
      <div>
        <h1>صنعة — Sanaa</h1>
        <div className="small">وصل الحرفيين الموثوقين بجانبك بسهولة</div>
      </div>
      <div>
        <button className={role==='user'?'button':'btn-outline'} onClick={()=>setRole('user')} style={{marginInlineEnd:8}}><User style={{verticalAlign:'middle'}}/> زبون</button>
        <button className={role==='admin'?'button':'btn-outline'} onClick={()=>setRole('admin')}><Users style={{verticalAlign:'middle'}}/> مدير</button>
      </div>
    </header>

    {role==='user' && <>
      {!selected ? <>
        <div style={{display:'flex',gap:8,marginBottom:12}}>
          <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="ابحث باسم الحرفي أو المهنة" style={{flex:1,padding:10,borderRadius:8,border:'1px solid #ddd'}}/>
          <button className="btn-outline" onClick={()=>setSearch('')}>مسح</button>
        </div>

        <div className="grid">
          {filtered.map(c=> <div key={c.id} className="card" onClick={()=>setSelected(c)} style={{cursor:'pointer'}}>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:8}}>
              <div>
                <div style={{fontWeight:600}}>{c.name}</div>
                <div className="small">{c.job}</div>
              </div>
              <Wrench />
            </div>
            <div style={{display:'flex',gap:8,alignItems:'center',marginBottom:8}}><Star/> <strong>{c.rating}</strong></div>
            <div style={{display:'flex',gap:8,alignItems:'center',marginBottom:12}}><MapPin/> <span className="small">{c.distance}</span></div>
            <div style={{display:'flex',gap:8}}>
              <button onClick={(e)=>{e.stopPropagation(); bookCraftsman(c)}} className="button" style={{flex:1}}>احجز الآن</button>
              <button onClick={(e)=>{e.stopPropagation(); alert('فتح دردشة (محاكاة) مع '+c.name)}} className="btn-outline" style={{flex:1}}>أرسل رسالة</button>
            </div>
          </div>)}
        </div>
      </> : (
        <div className="card">
          <button onClick={()=>setSelected(null)} className="small" style={{marginBottom:8}}>← رجوع</button>
          <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
            <div>
              <h2 style={{margin:0}}>{selected.name}</h2>
              <div className="small">{selected.job}</div>
            </div>
            <Wrench />
          </div>
          <div style={{marginTop:8,marginBottom:8}}>
            <div style={{display:'flex',gap:8,alignItems:'center'}}><Star/> <strong>{selected.rating}</strong></div>
            <div style={{display:'flex',gap:8,alignItems:'center'}}><MapPin/> <span className="small">{selected.distance}</span></div>
          </div>
          <h3>التقييمات:</h3>
          <ul className="small">
            {selected.reviews.map((r,i)=><li key={i}>{r}</li>)}
          </ul>
          <div style={{display:'flex',gap:8,marginTop:12}}>
            <button className="button" onClick={()=>bookCraftsman(selected)}>احجز الآن</button>
            <button className="btn-outline" onClick={()=>alert('فتح دردشة (محاكاة)')}>أرسل رسالة</button>
          </div>
        </div>
      )}

      <div style={{marginTop:16}}>
        <h3>الحجوزات الأخيرة (محاكاة)</h3>
        {bookings.length===0? <div className="small">لا توجد حجوزات</div> :
          bookings.map(b=> <div key={b.id} className="card" style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:8}}>
            <div>
              <div style={{fontWeight:600}}>{b.craftName}</div>
              <div className="small">{b.user} — {b.date}</div>
            </div>
            <div className="small">قيد الانتظار</div>
          </div>)
        }
      </div>
    </>}

    {role==='admin' && <>
      <h2>لوحة تحكم المدير</h2>
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12,marginTop:12}}>
        <div className="card">
          <h3>إدارة الحرفيين</h3>
          <table className="table">
            <thead><tr><th>الاسم</th><th>المهنة</th><th>تقييم</th><th>إجراءات</th></tr></thead>
            <tbody>
              {craftsmen.map(c=> <tr key={c.id}>
                <td>{c.name}</td>
                <td>{c.job}</td>
                <td>{c.rating}</td>
                <td>
                  <button className="button" onClick={()=>alert('اعتماد الحرفي '+c.id)} style={{marginInlineEnd:6}}>اعتماد</button>
                  <button className="btn-outline" onClick={()=>removeCraftsman(c.id)}>حذف</button>
                </td>
              </tr>)}
            </tbody>
          </table>
        </div>

        <div className="card">
          <h3>إدارة الحجوزات</h3>
          {bookings.length===0? <div className="small">لا توجد حجوزات</div> :
            bookings.map(b=> <div key={b.id} style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:8,background:'#fbfbfb',borderRadius:6,marginBottom:8}}>
              <div>
                <div style={{fontWeight:600}}>{b.craftName}</div>
                <div className="small">{b.user} — {b.date}</div>
              </div>
              <div style={{display:'flex',gap:8}}>
                <button className="button">قبول</button>
                <button className="btn-outline">رفض</button>
              </div>
            </div>)
          }
        </div>
      </div>
    </>}
    <footer className="footer">© 2025 Sanaa - صنعة</footer>
  </div>
}
