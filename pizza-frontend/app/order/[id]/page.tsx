import { OrderDetailPage } from '@/components/pages'

interface PageProps {
  params: { id: string }
}

export default function OrderPage({ params }: PageProps) {
  return <OrderDetailPage orderId={decodeURIComponent(params.id)} />
}
