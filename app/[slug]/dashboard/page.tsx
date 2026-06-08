'use client';
import { Box, Typography, Table, Sheet, Button, Tabs, TabList, Tab, CircularProgress, Alert, Card, CardContent, Grid } from '@mui/joy';
import { useState, useEffect } from 'react';
import { createApiService } from '@/lib/api-client';
import { NavBar } from '@/components/NavBar';
import { OrderData } from '@/types';
import { useAuth } from '@/components/AuthProvider';
import { useRouter } from 'next/navigation';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { use } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell,
} from 'recharts';

interface ItemStats { name: string; quantity: number; category: string; }
interface StorePerformance {
  storeNumber: number;
  startTime: string;
  endTime?: string;
  orderCount: number;
  itemStats: ItemStats[];
}

function aggregateItemStats(orders: OrderData[]): ItemStats[] {
  const stats: Record<string, ItemStats> = {};
  orders.forEach((order) => {
    order.items.forEach((cartItem) => {
      const name = cartItem.item.name;
      // Use the category snapshot stored on the order item — not the current live menu —
      // so stats remain correct even after items/categories are deleted.
      if (!stats[name]) stats[name] = { name, quantity: 0, category: cartItem.item.category || 'misc' };
      stats[name].quantity += cartItem.quantity;
    });
  });
  return Object.values(stats).sort((a, b) => b.quantity - a.quantity);
}

export default function DashboardPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const { user, loading, getIdToken } = useAuth();
  const router = useRouter();
  const api = createApiService(slug, getIdToken);

  const [storePerformance, setStorePerformance] = useState<StorePerformance[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState(0);

  useEffect(() => { if (!loading && !user) router.replace(`/login?next=/${slug}/dashboard`); }, [user, loading]);

  useEffect(() => {
    if (!user) return;
    (async () => {
      setIsLoading(true);
      try {
        const [ordersRes, sessionsRes] = await Promise.all([
          api.getCompletedOrders(),
          api.getStoreSessions(),
        ]);
        if (!ordersRes.success || !sessionsRes.success) {
          setError('Failed to load dashboard data');
          return;
        }
        const orders = ordersRes.data!;
        const sessions = sessionsRes.data!;

        const perf: StorePerformance[] = [];
        const legacy = orders.filter((o) => !o.storeNumber || o.storeNumber === 0);
        if (legacy.length > 0) {
          perf.push({ storeNumber: 0, startTime: 'Legacy Data', orderCount: legacy.length, itemStats: aggregateItemStats(legacy) });
        }
        for (const session of sessions) {
          const storeRes = await api.getOrdersByStore(session.storeNumber);
          if (storeRes.success && storeRes.data) {
            perf.push({ ...session, itemStats: aggregateItemStats(storeRes.data) });
          }
        }
        setStorePerformance(perf.reverse());
      } catch { setError('Unexpected error loading dashboard'); }
      finally { setIsLoading(false); }
    })();
  }, [slug, user]);

  if (loading || isLoading) return <Box sx={{ display: 'flex', justifyContent: 'center', pt: 10 }}><CircularProgress /></Box>;

  return (
    <>
      <NavBar slug={slug} showAdminLinks />
      <Box sx={{ pt: 10, px: { xs: 2, md: 4 }, pb: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3, gap: 2 }}>
          <Button variant="outlined" startDecorator={<ArrowBackIcon />} onClick={() => router.push(`/${slug}/orders`)}>
            Back to Orders
          </Button>
          <Typography level="h1">Dashboard</Typography>
        </Box>

        {error && <Alert color="danger" sx={{ mb: 2 }}>{error}</Alert>}

        {storePerformance.length === 0 ? (
          <Typography level="body-lg" sx={{ textAlign: 'center', mt: 4 }}>No completed sessions yet.</Typography>
        ) : (
          <Box>
            <Tabs value={activeTab} onChange={(_, v) => setActiveTab(v as number)}>
              <TabList sx={{ overflowX: 'auto', flexWrap: 'nowrap' }}>
                {storePerformance.map((s, i) => (
                  <Tab key={i} value={i}>
                    {s.storeNumber === 0 ? 'Legacy' : `Session ${s.storeNumber}`}
                  </Tab>
                ))}
              </TabList>
            </Tabs>

            {storePerformance[activeTab] && (
              <Box sx={{ mt: 3 }}>
                <Grid container spacing={2} sx={{ mb: 3 }}>
                  <Grid xs={12} sm={6}>
                    <Card variant="outlined">
                      <CardContent>
                        <Typography level="body-sm" sx={{ color: 'text.secondary' }}>Orders</Typography>
                        <Typography level="h2">{storePerformance[activeTab].orderCount}</Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                  <Grid xs={12} sm={6}>
                    <Card variant="outlined">
                      <CardContent>
                        <Typography level="body-sm" sx={{ color: 'text.secondary' }}>Start</Typography>
                        <Typography level="body-md">
                          {storePerformance[activeTab].startTime === 'Legacy Data'
                            ? 'Legacy Data'
                            : new Date(storePerformance[activeTab].startTime).toLocaleString(undefined, {
                                month: 'short', day: 'numeric', year: 'numeric',
                                hour: 'numeric', minute: '2-digit',
                              })}
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                </Grid>

                {storePerformance[activeTab].itemStats.length > 0 && (
                  <Card variant="outlined" sx={{ mb: 3, p: 2 }}>
                    <Typography level="title-sm" sx={{ mb: 2, color: 'text.secondary' }}>Items Sold</Typography>
                    <ResponsiveContainer width="100%" height={260}>
                      <BarChart
                        data={storePerformance[activeTab].itemStats.slice(0, 10)}
                        margin={{ top: 4, right: 16, left: -8, bottom: 60 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" />
                        <XAxis
                          dataKey="name"
                          tick={{ fill: 'rgba(255,255,255,0.55)', fontSize: 12 }}
                          angle={-35}
                          textAnchor="end"
                          interval={0}
                        />
                        <YAxis
                          allowDecimals={false}
                          tick={{ fill: 'rgba(255,255,255,0.55)', fontSize: 12 }}
                        />
                        <Tooltip
                          contentStyle={{ background: '#1c1c1e', border: '1px solid rgba(255,255,255,0.15)', borderRadius: 8, color: '#fff' }}
                          cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                          formatter={(v) => [v, 'sold']}
                        />
                        <Bar dataKey="quantity" radius={[4, 4, 0, 0]}>
                          {storePerformance[activeTab].itemStats.slice(0, 10).map((_, i) => (
                            <Cell key={i} fill={`var(--joy-palette-primary-${i === 0 ? '500' : i < 3 ? '400' : '300'})`} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </Card>
                )}

                <Sheet variant="outlined" sx={{ borderRadius: 'md', overflow: 'hidden' }}>
                  <Table hoverRow>
                    <thead>
                      <tr>
                        <th>Item</th>
                        <th>Category</th>
                        <th>Qty Sold</th>
                      </tr>
                    </thead>
                    <tbody>
                      {storePerformance[activeTab].itemStats.map((stat) => (
                        <tr key={stat.name}>
                          <td>{stat.name}</td>
                          <td>{stat.category}</td>
                          <td>{stat.quantity}</td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                </Sheet>
              </Box>
            )}
          </Box>
        )}
      </Box>
    </>
  );
}
