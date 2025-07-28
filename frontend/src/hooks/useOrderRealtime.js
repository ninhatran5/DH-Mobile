import { useEffect, useRef } from "react";
import Pusher from "pusher-js";

export default function useOrderRealtime({
  userId,
  orderId,
  onOrderUpdate,
  onReturnUpdate,
}) {
  const onOrderUpdateRef = useRef(onOrderUpdate);
  const onReturnUpdateRef = useRef(onReturnUpdate);

  useEffect(() => {
    onOrderUpdateRef.current = onOrderUpdate;
  }, [onOrderUpdate]);

  useEffect(() => {
    onReturnUpdateRef.current = onReturnUpdate;
  }, [onReturnUpdate]);

  useEffect(() => {
    if (!userId || !orderId) return;

    const pusher = new Pusher(import.meta.env.VITE_PUSHER_KEY, {
      cluster: import.meta.env.VITE_PUSHER_CLUSTER,
      encrypted: true,
    });

    const orderChannel = pusher.subscribe(`orders.${userId}`);
    orderChannel.bind("OrderUpdated", (data) => {
      if (data.order.order_id == orderId) {
        onOrderUpdateRef.current?.(data.order);
      }
    });

    const returnChannel = pusher.subscribe(`order.${orderId}`);
    returnChannel.bind("order-return-updated", (data) => {
      onReturnUpdateRef.current?.(data);
    });

    return () => {
      orderChannel.unbind_all();
      orderChannel.unsubscribe();
      returnChannel.unbind_all();
      returnChannel.unsubscribe();
      pusher.disconnect();
    };
  }, [userId, orderId]);
}
