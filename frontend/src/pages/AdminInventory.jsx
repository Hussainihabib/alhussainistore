import { useEffect, useState } from "react";
import api from "../api";

export default function AdminInventory() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadInventory = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/admin/inventory");

      const data = response.data;

      setRows(Array.isArray(data) ? data : data?.products || []);
    } catch (err) {
      console.error("Inventory loading error:", err);

      setError(
        err?.response?.data?.message ||
          "Failed to load inventory."
      );

      setRows([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInventory();
  }, []);

  if (loading) {
    return (
      <div className="py-10">
        <h1 className="text-3xl font-serif">
          INVENTORY & LOW STOCK
        </h1>

        <div className="card mt-6 p-6">
          Loading inventory...
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-serif">
            INVENTORY & LOW STOCK
          </h1>

          <p className="text-sm text-stone-500 mt-1">
            Manage product stock and monitor low inventory.
          </p>
        </div>

        <button
          onClick={loadInventory}
          className="btn-brand"
        >
          REFRESH
        </button>
      </div>

      {error && (
        <div className="mt-6 card p-5 border border-red-300 text-red-600">
          <p className="font-semibold">
            {error}
          </p>

          <button
            onClick={loadInventory}
            className="mt-3 underline"
          >
            Try Again
          </button>
        </div>
      )}

      {!error && rows.length === 0 && (
        <div className="card p-6 mt-6 text-stone-500">
          No inventory products found.
        </div>
      )}

      {!error && rows.length > 0 && (
        <div className="grid gap-4 mt-6">
          {rows.map((row, index) => {
            const variants = Array.isArray(row?.variants)
              ? row.variants
              : [];

            const totalStock =
              Number(row?.totalStock) ||
              variants.reduce(
                (sum, variant) =>
                  sum + (Number(variant?.stock) || 0),
                0
              );

            const isLow =
              row?.low === true ||
              totalStock <= 5;

            return (
              <div
                className={`card p-5 ${
                  isLow
                    ? "border border-red-300"
                    : ""
                }`}
                key={row?._id || row?.id || index}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <b className="text-lg">
                      {row?.name || "Unnamed Product"}
                    </b>

                    {row?.sku && (
                      <p className="text-xs text-stone-500 mt-1">
                        SKU: {row.sku}
                      </p>
                    )}
                  </div>

                  <div
                    className={
                      isLow
                        ? "text-red-600 font-bold"
                        : "text-green-600 font-bold"
                    }
                  >
                    {totalStock} Total Stock
                  </div>
                </div>

                {variants.length > 0 ? (
                  <div className="flex flex-wrap gap-2 mt-4">
                    {variants.map((variant, variantIndex) => {
                      const stock =
                        Number(variant?.stock) || 0;

                      const variantLow = stock <= 5;

                      return (
                        <span
                          className={`px-3 py-2 rounded-lg text-sm ${
                            variantLow
                              ? "bg-red-50 text-red-700"
                              : "bg-stone-100 text-stone-700"
                          }`}
                          key={
                            variant?._id ||
                            variant?.id ||
                            variantIndex
                          }
                        >
                          {variant?.size || "N/A"} /{" "}
                          {variant?.color || "Default"}:
                          {" "}
                          <b>{stock}</b>
                        </span>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-sm text-stone-500 mt-3">
                    No variants available for this product.
                  </p>
                )}
              </div>
            );
          })}
        </div>
      )}
    </>
  );
}