import { useState, useEffect } from 'react';
import { MapPin, Star, Wrench, User, Users } from 'lucide-react';

export default function Home() {
  const [role, setRole] = useState('user');
  const [craftsmen, setCraftsmen] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      const [craftRes, bookRes] = await Promise.all([
        fetch('/api/craftsmen'),
        fetch('/api/bookings'),
      ]);
      const [craftJson, bookJson] = await Promise.all([
        craftRes.ok ? craftRes.json() : Promise.resolve([]),
        bookRes.ok ? bookRes.json() : Promise.resolve([]),
      ]);
      setCraftsmen(Array.isArray(craftJson) ? craftJson : []);
      setBookings(Array.isArray(bookJson) ? bookJson : []);
    } catch (e) {
      console.error('loadData error:', e);
      setCraftsmen([]);
      setBookings([]);
    }
  }

  async function seedData() {
    setLoading(true);
    try {
      const res = await fetch('/api/seed', { method: 'POST' });
      const data = await res.json().catch(() => ({}));
      if (res.ok) {
        alert(data.message || 'تم تحميل البيانات');
        await loadData();
      } else {
        alert(data.error || 'فشل تحميل البيانات');
      }
    } catch (e) {
      console.error('seed error:', e);
      alert('فشل تحميل البيانات');
    } finally {
      setLoading(false);
    }
  }

  async function bookCraftsman(c) {
    try {
      const res = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          craftId: c?._id,
          craftName: c?.name || '',
          user: 'مستخدم تجريبي',
        }),
      });
      const nb = await res.json().catch(() => null);
      if (res.ok && nb) {
        setBookings((b) => [nb, ...b]);
        alert('تم إرسال طلب الحجز إلى ' + (c?.name || 'الحرفي'));
      } else {
        alert('فشل إنشاء الحجز');
      }
    } catch (e) {
      console.error('book error:', e);
      alert('حدث خطأ أثناء الحجز');
    }
  }

  async function removeCraftsman(id) {
    if (!id) return;
    if (!confirm('هل تريد حذف الحرفي؟')) return;
    try {
      const res = await fetch('/api/craftsmen', {
        method: 'DELETE',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ id }),
      });
      if (res.ok) {
        setCraftsmen((c) => c.filter((x) => x._id !== id));
      } else {
        alert('فشل حذف الحرفي');
      }
    } catch (e) {
      console.error('remove error:', e);
      alert('حدث خطأ أثناء الحذف');
    }
  }

  const filtered = craftsmen.filter((c) => {
    const q = (search || '').trim();
    if (!q) return true;
    return (c?.name || '').includes(q) || (c?.job || '').includes(q);
  });

  return (
    <div className="container">
      <header className="header">
        <div>
          <h1>Sanaa — صنعة</h1>
          <div className="small">وصل الحرفيين بعملائك بسهولة</div>
        </div>
        <div>
          <button
            className={role === 'user' ? 'button' : 'btn-outline'}
            onClick={() => setRole('user')}
            style={{ marginInlineEnd: 8 }}
          >
            <User style={{ verticalAlign: 'middle' }} /> زبون
          </button>
          <button
            className={role === 'admin' ? 'button' : 'btn-outline'}
            onClick={() => setRole('admin')}
          >
            <Users style={{ verticalAlign: 'middle' }} /> مدير
          </button>
        </div>
      </header>

      {role === 'user' && (
        <>
          {!selected ? (
            <>
              <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="بحث باسم الحرفي أو المهنة"
                  style={{
                    flex: 1,
                    padding: 10,
                    borderRadius: 8,
                    border: '1px solid #ddd',
                  }}
                />
                <button className="btn-outline" onClick={() => setSearch('')}>
                  مسح
                </button>
              </div>

              <div className="grid">
                {filtered.length === 0 && (
                  <div className="small">لا توجد نتائج مطابقة الآن</div>
                )}

                {filtered.map((c) => (
                  <div
                    key={c._id}
                    className="card"
                    onClick={() => setSelected(c)}
                    style={{ cursor: 'pointer' }}
                  >
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        marginBottom: 8,
                      }}
                    >
                      <div>
                        <div style={{ fontWeight: 600 }}>{c.name}</div>
                        <div className="small">{c.job}</div>
                      </div>
                      <Wrench />
                    </div>

                    <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 8 }}>
                      <Star /> <strong>{c.rating ?? '-'}</strong>
                    </div>

                    <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 12 }}>
                      <MapPin /> <span className="small">{c.distance || '—'}</span>
                    </div>

                    <div style={{ display: 'flex', gap: 8 }}>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          bookCraftsman(c);
                        }}
                        className="button"
                        style={{ flex: 1 }}
                      >
                        احجز الآن
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          alert('فتح دردشة (محاكاة) مع ' + (c.name || 'الحرفي'));
                        }}
                        className="btn-outline"
                        style={{ flex: 1 }}
                      >
                        أرسل رسالة
                      </button>
                    </div>

                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="card">
              <button
                onClick={() => setSelected(null)}
                className="small"
                style={{ marginBottom: 8 }}
              >
                ← رجوع
              </button>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h2 style={{ margin: 0 }}>{selected?.name}</h2>
                  <div className="small">{selected?.job}</div>
                </div>
                <Wrench />
              </div>

              <div style={{ marginTop: 8, marginBottom: 8 }}>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  <Star /> <strong>{selected?.rating ?? '-'}</strong>
                </div>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  <MapPin /> <span className="small">{selected?.distance || '—'}</span>
                </div>
              </div>

              <h3>التقييمات:</h3>
              <ul className="small">
                {Array.isArray(selected?.reviews) && selected.reviews.length > 0 ? (
                  selected.reviews.map((r, i) => <li key={i}>{r}</li>)
                ) : (
                  <li>لا توجد تقييمات بعد</li>
                )}
              </ul>

              <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
                <button className="button" onClick={() => bookCraftsman(selected)}>
                  احجز الآن
                </button>
                <button className="btn-outline" onClick={() => alert('فتح دردشة (محاكاة)')}>
                  أرسل رسالة
                </button>
              </div>
            </div>
          )}

          <div style={{ marginTop: 16 }}>
            <h3>الحجوزات الأخيرة</h3>

            {bookings.length === 0 ? (
              <div className="small">لا توجد حجوزات</div>
            ) : (
              bookings.map((b) => (
                <div
                  key={b._id || b.id}
                  className="card"
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: 8,
                  }}
                >
                  <div>
                    <div style={{ fontWeight: 600 }}>{b.craftName}</div>
                    <div className="small">{b.user} — {b.date}</div>
                  </div>
                  <div className="small">قيد الانتظار</div>
                </div>
              ))
            )}
          </div>
        </>
      )}

      {role === 'admin' && (
        <>
          <h2>لوحة تحكم المدير</h2>

          <div style={{ marginBottom: 12 }}>
            <button
              className="btn-outline"
              onClick={seedData}
              disabled={loading}
            >
              {loading ? 'جاري التحميل...' : 'تحميل بيانات تجريبية'}
            </button>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: 12,
              marginTop: 12,
            }}
          >
            <div className="card">
              <h3>إدارة الحرفيين</h3>
              <table className="table">
                <thead>
                  <tr>
                    <th>الاسم</th>
                    <th>المهنة</th>
                    <th>تقييم</th>
                    <th>إجراءات</th>
                  </tr>
                </thead>
                <tbody>
                  {craftsmen.length === 0 ? (
                    <tr>
                      <td className="small" colSpan={4}>لا توجد بيانات للحرفيين</td>
                    </tr>
                  ) : (
                    craftsmen.map((c) => (
                      <tr key={c._id}>
                        <td>{c.name}</td>
                        <td>{c.job}</td>
                        <td>{c.rating ?? '-'}</td>
                        <td>
                          <button
                            className="button"
                            onClick={() => alert('اعتماد الحرفي ' + c._id)}
                            style={{ marginInlineEnd: 6 }}
                          >
                            اعتماد
                          </button>
                          <button
                            className="btn-outline"
                            onClick={() => removeCraftsman(c._id)}
                          >
                            حذف
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            <div className="card">
              <h3>إدارة الحجوزات</h3>

              {bookings.length === 0 ? (
                <div className="small">لا توجد حجوزات</div>
              ) : (
                bookings.map((b) => (
                  <div
                    key={b._id || b.id}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: 8,
                      background: '#fbfbfb',
                      borderRadius: 6,
                      marginBottom: 8,
                    }}
                  >
                    <div>
                      <div style={{ fontWeight: 600 }}>{b.craftName}</div>
                      <div className="small">{b.user} — {b.date}</div>
                    </div>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <button className="button">قبول</button>
                      <button className="btn-outline">رفض</button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </>
      )}

      <footer className="footer">© 2026 Sanaa - صنعة</footer>

      <div 
        style={{
          marginTop: 10,
          marginBottom: 20,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <div
          style={{
            background: '#1a1a1a',
            padding: '8px 15px',
            borderRadius: 8,
            border: '1px solid #DAA520',
            boxShadow: '0 0 6px rgba(218,165,32,0.3)',
            color: '#DAA520',
            fontWeight: 'bold',
            fontSize: 12,
            textAlign: 'center',
            lineHeight: 1.4,
            opacity: 0.9
          }}
        >
          Developed by: Ahmed Kamal — Elhussein Ahmed —  
          Hamed Salah — Hossam Ahmed
        </div>
      </div>

    </div>
  );
}

