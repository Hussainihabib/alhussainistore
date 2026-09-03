import { useEffect, useState } from "react";
import api from "../api";

const reasons = [
  "Ordered by mistake",
  "Wrong size selected",
  "Want to change product",
  "Duplicate order",
  "Delivery is taking too long",
  "Other",
];

export default function MyOrders() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  const [cancelId, setCancelId] = useState("");
  const [reason, setReason] = useState("");
  const [other, setOther] = useState("");
  const [cancelling, setCancelling] = useState(false);

  const load = async () => {
    try {
      setLoading(true);
      setErr("");

      const response = await api.get("/orders/my", {
        headers: {
          "Cache-Control": "no-cache",
        },
      });

      console.log("MY ORDERS RESPONSE:", response.data);

      const data = response.data;

      const orders = Array.isArray(data)
        ? data
        : Array.isArray(data?.orders)
        ? data.orders
        : Array.isArray(data?.data)
        ? data.data
        : Array.isArray(data?.data?.orders)
        ? data.data.orders
        : [];

      setRows(orders);
    } catch (error) {
      console.error(
        "MY ORDERS LOAD ERROR:",
        error.response?.data || error
      );

      setRows([]);

      setErr(
        error.response?.data?.message ||
          error.response?.data?.error ||
          "Failed to load orders."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const closeCancelModal = () => {
    setCancelId("");
    setReason("");
    setOther("");
  };

  const downloadInvoice = async (id, orderId) => {
    if (!id) return;
    try {
      const r = await api.get(`/orders/my/${id}/invoice`, { responseType: "blob" });
      const url = window.URL.createObjectURL(new Blob([r.data], { type: "application/pdf" }));
      const a = document.createElement("a");
      a.href = url;
      a.download = `invoice-${orderId || id}.pdf`;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      alert("Unable to download invoice right now.");
    }
  };

  const cancelOrder = async () => {
    const finalReason =
      reason === "Other"
        ? other.trim()
        : reason;

    if (!finalReason) {
      alert("Please select a cancellation reason.");
      return;
    }

    try {
      setCancelling(true);

      await api.patch(
        `/orders/my/${cancelId}`,
        {
          action: "cancel",
          reason: finalReason,
        }
      );

      closeCancelModal();

      await load();
    } catch (error) {
      console.error(
        "CANCEL ORDER ERROR:",
        error.response?.data || error
      );

      alert(
        error.response?.data?.message ||
          error.response?.data?.error ||
          "Unable to cancel order."
      );
    } finally {
      setCancelling(false);
    }
  };

  const getOrderId = (order, index) =>
    order?._id ||
    order?.id ||
    order?.orderId ||
    index;

  const getItems = (order) =>
    Array.isArray(order?.items)
      ? order.items
      : [];

  if (loading) {
    return (
      <div className="container py-12">
        <div className="card p-6">
          Loading orders...
        </div>
      </div>
    );
  }

  return (
    <div className="container py-10">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-serif">
            MY ORDERS
          </h1>

          <p className="text-sm text-stone-500 mt-1">
            View and manage your orders.
          </p>
        </div>

        <button
          type="button"
          className="btn border"
          onClick={load}
        >
          REFRESH
        </button>
      </div>

      {err && (
        <div className="card mt-5 p-4 border border-red-300 text-red-600">
          {err}
        </div>
      )}

      {!rows.length && !err && (
        <div className="card p-6 mt-6">
          You have not placed any orders yet.
        </div>
      )}

      <div className="grid gap-4 mt-6">
        {rows.map((order, orderIndex) => {
          const orderId = getOrderId(
            order,
            orderIndex
          );

          const items = getItems(order);

          const status =
            order?.status || "Pending";

          const canCancel =
            ![
              "Shipped",
              "Delivered",
              "Cancelled",
              "Out for Delivery",
            ].includes(status);

          return (
            <div
              className="card p-5"
              key={orderId}
            >
              <div className="flex flex-col md:flex-row justify-between gap-3">
                <div>
                  <b>
                    {order?.orderId ||
                      `ORDER-${orderIndex + 1}`}
                  </b>

                  {order?.createdAt && (
                    <p className="text-sm text-stone-500 mt-1">
                      {new Date(
                        order.createdAt
                      ).toLocaleString()}
                    </p>
                  )}
                </div>

                <div className="md:text-right">
                  <b className="text-brand">
                    {status}
                  </b>

                  <p className="mt-1">
                    PKR{" "}
                    {Number(
                      order?.totalAmount || 0
                    ).toLocaleString()}
                  </p>
                </div>
              </div>

              <div className="border-t mt-4 pt-4">
                {items.length === 0 ? (
                  <p className="text-sm text-stone-500">
                    No items found for this order.
                  </p>
                ) : (
                  items.map((item, itemIndex) => (
                    <div
                      className="flex flex-col sm:flex-row sm:justify-between gap-1 text-sm py-2"
                      key={
                        item?._id ||
                        item?.variantId ||
                        itemIndex
                      }
                    >
                      <span>
                        <b>
                          {item?.name ||
                            "Product"}
                        </b>

                        {" — "}

                        Size{" "}
                        {item?.size || "N/A"}

                        {", Color "}

                        {item?.color || "N/A"}

                        {" × "}

                        {item?.quantity || 1}
                      </span>

                      <b>
                        PKR{" "}
                        {Number(
                          item?.price || 0
                        ).toLocaleString()}
                      </b>
                    </div>
                  ))
                )}
              </div>

              {order?.cancellationReason && (
                <div className="mt-4 p-3 rounded-lg border border-red-200 bg-red-50">
                  <p className="text-sm text-red-600">
                    <b>
                      Cancellation reason:
                    </b>{" "}
                    {
                      order.cancellationReason
                    }
                  </p>
                </div>
              )}

              {Array.isArray(
                order?.timeline
              ) &&
                order.timeline.length > 0 && (
                  <div className="mt-4">
                    <p className="text-sm font-medium mb-2">
                      Order Timeline
                    </p>

                    <div className="flex flex-wrap gap-2 text-xs">
                      {order.timeline.map(
                        (timelineItem, index) => (
                          <span
                            key={index}
                            className="border rounded-full px-3 py-1"
                          >
                            ✓{" "}
                            {timelineItem?.status ||
                              timelineItem}
                          </span>
                        )
                      )}
                    </div>
                  </div>
                )}

              {order?.trackingNo && (
                <div className="mt-4 text-sm">
                  Courier:{" "}
                  <b>
                    {order?.courier ||
                      "Courier"}
                  </b>

                  {" · Tracking: "}

                  <b>
                    {order.trackingNo}
                  </b>
                </div>
              )}

              <div className="flex flex-wrap gap-3 mt-5">
                <button
                  type="button"
                  className="btn border border-brand text-brand"
                  onClick={() =>
                    downloadInvoice(
                      order?._id || order?.id,
                      order?.orderId
                    )
                  }
                >
                  DOWNLOAD INVOICE
                </button>

                {canCancel && (
                  <button
                    type="button"
                    className="text-red-600 font-medium px-3"
                    onClick={() =>
                      setCancelId(
                        order?._id ||
                          order?.id
                      )
                    }
                  >
                    Cancel Order
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {cancelId && (
        <div className="fixed inset-0 z-50 bg-black/40 grid place-items-center p-4">
          <div className="card w-full max-w-md p-6">
            <h2 className="text-2xl font-serif">
              Cancel Order
            </h2>

            <p className="text-sm text-stone-500 mt-2">
              Please tell us why you want to
              cancel this order.
            </p>

            <select
              className="field mt-4"
              value={reason}
              onChange={(e) =>
                setReason(
                  e.target.value
                )
              }
            >
              <option value="">
                Select reason
              </option>

              {reasons.map((item) => (
                <option
                  key={item}
                  value={item}
                >
                  {item}
                </option>
              ))}
            </select>

            {reason === "Other" && (
              <textarea
                className="field mt-3"
                placeholder="Enter your reason"
                value={other}
                onChange={(e) =>
                  setOther(
                    e.target.value
                  )
                }
              />
            )}

            <div className="flex gap-3 mt-5">
              <button
                type="button"
                className="btn border flex-1"
                onClick={
                  closeCancelModal
                }
                disabled={cancelling}
              >
                KEEP ORDER
              </button>

              <button
                type="button"
                className="btn-brand flex-1"
                onClick={cancelOrder}
                disabled={cancelling}
              >
                {cancelling
                  ? "CANCELLING..."
                  : "CONFIRM CANCEL"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}