import { useEffect } from "react";
import Pusher from "pusher-js";

export default function useOrderRealtime({ userId, orderId, onOrderUpdate }) {
  useEffect(() => {
    if (!userId || !orderId) return;

    const pusher = new Pusher(import.meta.env.VITE_PUSHER_KEY, {
      cluster: import.meta.env.VITE_PUSHER_CLUSTER,
      encrypted: true,
    });

    const channel = pusher.subscribe(`orders.${userId}`);
    channel.bind("OrderUpdated", (data) => {
      if (data.order.order_id === orderId) {
        onOrderUpdate(data.order);
      }
    });

    return () => {
      channel.unbind_all();
      channel.unsubscribe();
      pusher.disconnect();
    };
  }, [userId, orderId, onOrderUpdate]);
}
