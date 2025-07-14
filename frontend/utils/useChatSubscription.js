import { useEffect } from "react";
import Pusher from "pusher-js";
import { fetchChatMessage } from "../src/slices/chatLiveSlice";

export default function useChatSubscription(profile, dispatch, setMessages) {
  useEffect(() => {
    if (!profile?.user?.id) return;

    const pusher = new Pusher("dcc715adcba25f4b8d09", {
      cluster: "ap1",
      authEndpoint: `${
        import.meta.env.VITE_BASE_URL_REAL_TIME
      }/broadcasting/auth`,
      auth: {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      },
      withCredentials: true,
    });

    const channel = pusher.subscribe(`private-chat.user.${profile.user.id}`);

    channel.bind("SupportChatSent", function () {
      dispatch(fetchChatMessage(profile.user.id))
        .unwrap()
        .then((data) => {
          if (data.success && data.chats) {
            const formattedMessages = data.chats.map((chat) => ({
              sender: chat.sender === "customer" ? "user" : "admin",
              message: chat.message,
              images: chat.attachments?.map((att) => att.file_url) || [],
              created_at: chat.sent_at,
              is_read: chat.is_read,
            }));
            setMessages(formattedMessages);
          }
        });
    });

    return () => {
      channel.unbind_all();
      channel.unsubscribe();
      pusher.disconnect();
    };
  }, [profile?.user?.id, dispatch, setMessages]);
}
