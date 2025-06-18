import AddressItem from "./AddressItem";

export default function AddressList({ addresses }) {
  if (!Array.isArray(addresses) || addresses.length === 0) return null;

  return (
    <>
      {addresses.map((address, idx) => (
        <div key={address?.address_id || idx}>
          <AddressItem
            name={address?.recipient_name || ""}
            phone={address?.phone || ""}
            address={address?.address || ""}
            isDefault={false}
            radioId={`radioDefault${idx + 2}`}
          />
          <hr className="address-divider" />
        </div>
      ))}
    </>
  );
}
