import { useEffect, useState } from "react";
import {
  Plus,
  Pencil,
  Trash2,
  Star,
  ToggleLeft,
  ToggleRight,
  X,
  Image as ImageIcon,
  Tag,
  AlertCircle,
  Loader2,
  Upload,
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import { FeaturedItem } from "@/lib/types";

const formatPrice = (n: number) => `₦${n.toLocaleString()}`;

const EMPTY_FORM = {
  title: "",
  description: "",
  main_price: "",
  discounted_price: "",
  image_url: "",
  is_active: true,
};

type FormState = typeof EMPTY_FORM;

const AdminFeatured = () => {
  const [items, setItems] = useState<FeaturedItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [uploadingImg, setUploadingImg] = useState(false);

  const fetchItems = async () => {
    const { data } = await supabase
      .from("featured_items")
      .select("*")
      .order("created_at", { ascending: false });
    setItems((data as FeaturedItem[]) ?? []);
    setLoading(false);
  };

  useEffect(() => {
    fetchItems();
    const channel = supabase
      .channel("admin-featured")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "featured_items" },
        () => fetchItems()
      )
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, []);

  const openAdd = () => {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setError(null);
    setShowModal(true);
  };

  const openEdit = (item: FeaturedItem) => {
    setEditingId(item.id);
    setForm({
      title: item.title,
      description: item.description ?? "",
      main_price: item.main_price.toString(),
      discounted_price: item.discounted_price.toString(),
      image_url: item.image_url ?? "",
      is_active: item.is_active,
    });
    setError(null);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingId(null);
    setForm(EMPTY_FORM);
    setError(null);
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setUploadingImg(true);
      setError(null);

      if (!event.target.files || event.target.files.length === 0) {
        throw new Error("You must select an image to upload.");
      }

      const file = event.target.files[0];
      const fileExt = file.name.split(".").pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("featured-images")
        .upload(filePath, file);

      if (uploadError) {
        throw uploadError;
      }

      const { data: { publicUrl } } = supabase.storage
        .from("featured-images")
        .getPublicUrl(filePath);

      setForm((f) => ({ ...f, image_url: publicUrl }));
    } catch (error: any) {
        setError(error.message);
    } finally {
      setUploadingImg(false);
    }
  };

  const validate = (): string | null => {
    if (!form.title.trim()) return "Title is required.";
    const main = parseFloat(form.main_price);
    const disc = parseFloat(form.discounted_price);
    if (isNaN(main) || main <= 0) return "Enter a valid main price.";
    if (isNaN(disc) || disc <= 0) return "Enter a valid discounted price.";
    if (disc >= main) return "Discounted price must be less than main price.";
    return null;
  };

  const handleSave = async () => {
    const validationError = validate();
    if (validationError) { setError(validationError); return; }

    setSaving(true);
    setError(null);

    const payload = {
      title: form.title.trim(),
      description: form.description.trim() || null,
      main_price: Math.round(parseFloat(form.main_price)),
      discounted_price: Math.round(parseFloat(form.discounted_price)),
      image_url: form.image_url.trim() || null,
      is_active: form.is_active,
    };

    if (editingId) {
      const { error: err } = await supabase
        .from("featured_items")
        .update(payload)
        .eq("id", editingId);
      if (err) setError("Failed to update item.");
    } else {
      const { error: err } = await supabase
        .from("featured_items")
        .insert(payload);
      if (err) setError("Failed to add item.");
    }

    setSaving(false);
    if (!error) closeModal();
  };

  const handleDelete = async (id: string) => {
    await supabase.from("featured_items").delete().eq("id", id);
    setDeleteConfirmId(null);
  };

  const toggleActive = async (item: FeaturedItem) => {
    await supabase
      .from("featured_items")
      .update({ is_active: !item.is_active })
      .eq("id", item.id);
  };

  const activeCount = items.filter((i) => i.is_active).length;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-foreground flex items-center gap-2">
            <Star size={20} className="text-primary" />
            Featured Items
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage promotional & featured deals shown to customers.
          </p>
        </div>
        <button
          onClick={openAdd}
          className="flex items-center gap-2 px-4 py-2.5 bg-primary text-primary-foreground rounded-xl text-sm font-semibold hover:brightness-110 active:scale-[0.97] transition-all shadow-md flex-shrink-0"
        >
          <Plus size={16} />
          <span className="hidden sm:inline">Add Item</span>
          <span className="sm:hidden">Add</span>
        </button>
      </div>

      {/* Summary stats */}
      <div className="flex gap-3">
        <div className="bg-primary/10 border border-primary/20 px-4 py-2.5 rounded-xl">
          <p className="text-xs text-muted-foreground">Total</p>
          <p className="text-lg font-bold text-primary">{items.length}</p>
        </div>
        <div className="bg-green-500/10 border border-green-500/20 px-4 py-2.5 rounded-xl">
          <p className="text-xs text-muted-foreground">Active</p>
          <p className="text-lg font-bold text-green-400">{activeCount}</p>
        </div>
        <div className="bg-secondary/40 border border-border px-4 py-2.5 rounded-xl">
          <p className="text-xs text-muted-foreground">Inactive</p>
          <p className="text-lg font-bold text-muted-foreground">
            {items.length - activeCount}
          </p>
        </div>
      </div>

      {/* Items list */}
      {items.length === 0 ? (
        <div className="text-center py-20 glass-strong rounded-2xl border border-border/50">
          <Star size={36} className="text-primary/30 mx-auto mb-3" />
          <p className="text-foreground font-medium">No featured items yet</p>
          <p className="text-sm text-muted-foreground mt-1 mb-4">
            Add your first promotional deal
          </p>
          <button
            onClick={openAdd}
            className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-xl text-sm font-semibold hover:brightness-110 transition-all"
          >
            <Plus size={15} /> Add First Item
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {items.map((item) => {
            const discount = Math.round(
              ((item.main_price - item.discounted_price) / item.main_price) * 100
            );
            return (
              <div
                key={item.id}
                className={`glass-strong rounded-2xl border overflow-hidden transition-all ${
                  item.is_active
                    ? "border-border/50"
                    : "border-border/30 opacity-60"
                }`}
              >
                <div className="flex items-center gap-3 p-4">
                  {/* Image */}
                  <div className="w-14 h-14 flex-shrink-0 rounded-xl overflow-hidden bg-secondary/50 border border-border/50">
                    {item.image_url ? (
                      <img
                        src={item.image_url}
                        alt={item.title}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = "";
                          (e.target as HTMLImageElement).style.display = "none";
                        }}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <ImageIcon size={20} className="text-muted-foreground/50" />
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-semibold text-foreground text-sm truncate">
                        {item.title}
                      </p>
                      <span className="flex-shrink-0 text-[10px] font-bold bg-primary/15 text-primary border border-primary/30 px-1.5 py-0.5 rounded-full">
                        -{discount}%
                      </span>
                    </div>
                    {item.description && (
                      <p className="text-xs text-muted-foreground truncate mb-1">
                        {item.description}
                      </p>
                    )}
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-primary">
                        {formatPrice(item.discounted_price)}
                      </span>
                      <span className="text-xs text-muted-foreground line-through">
                        {formatPrice(item.main_price)}
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1.5 flex-shrink-0">
                    {/* Active toggle */}
                    <button
                      onClick={() => toggleActive(item)}
                      title={item.is_active ? "Deactivate" : "Activate"}
                      className="p-1.5 rounded-lg hover:bg-secondary/50 transition-colors"
                    >
                      {item.is_active ? (
                        <ToggleRight size={22} className="text-green-400" />
                      ) : (
                        <ToggleLeft size={22} className="text-muted-foreground" />
                      )}
                    </button>

                    {/* Edit */}
                    <button
                      onClick={() => openEdit(item)}
                      className="p-1.5 rounded-lg hover:bg-secondary/50 transition-colors"
                      title="Edit"
                    >
                      <Pencil size={15} className="text-muted-foreground" />
                    </button>

                    {/* Delete */}
                    {deleteConfirmId === item.id ? (
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleDelete(item.id)}
                          className="px-2 py-1 bg-red-500/20 text-red-400 border border-red-500/30 rounded-lg text-xs font-medium hover:bg-red-500/30 transition-colors"
                        >
                          Confirm
                        </button>
                        <button
                          onClick={() => setDeleteConfirmId(null)}
                          className="p-1 rounded-lg hover:bg-secondary/50 transition-colors"
                        >
                          <X size={14} className="text-muted-foreground" />
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setDeleteConfirmId(item.id)}
                        className="p-1.5 rounded-lg hover:bg-red-500/10 transition-colors"
                        title="Delete"
                      >
                        <Trash2 size={15} className="text-muted-foreground hover:text-red-400" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add / Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={closeModal}
          />

          {/* Modal Panel */}
          <div className="relative w-full sm:max-w-md bg-background border border-border/50 rounded-t-3xl sm:rounded-2xl shadow-2xl animate-in slide-in-from-bottom-4 sm:slide-in-from-bottom-0 sm:zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-5 pt-5 pb-4 border-b border-border/50">
              <h2 className="text-base font-bold text-foreground flex items-center gap-2">
                <Star size={16} className="text-primary" />
                {editingId ? "Edit Featured Item" : "Add Featured Item"}
              </h2>
              <button
                onClick={closeModal}
                className="p-1.5 rounded-xl hover:bg-secondary/50 transition-colors"
              >
                <X size={18} className="text-muted-foreground" />
              </button>
            </div>

            {/* Form */}
            <div className="px-5 py-4 space-y-4 max-h-[70vh] overflow-y-auto">
              {/* Title */}
              <div>
                <label className="block text-xs font-semibold text-muted-foreground mb-1.5 uppercase tracking-wide">
                  Title *
                </label>
                <input
                  type="text"
                  placeholder="e.g. Weekend Special Combo"
                  value={form.title}
                  onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                  className="w-full px-3.5 py-2.5 bg-secondary/40 border border-border rounded-xl text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-semibold text-muted-foreground mb-1.5 uppercase tracking-wide">
                  Description
                </label>
                <textarea
                  placeholder="Short description (optional)"
                  value={form.description}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, description: e.target.value }))
                  }
                  rows={2}
                  className="w-full px-3.5 py-2.5 bg-secondary/40 border border-border rounded-xl text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all resize-none"
                />
              </div>

              {/* Pricing Row */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-muted-foreground mb-1.5 uppercase tracking-wide">
                    Main Price (₦) *
                  </label>
                  <div className="relative">
                    <Tag
                      size={13}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                    />
                    <input
                      type="number"
                      min="0"
                      placeholder="e.g. 5000"
                      value={form.main_price}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, main_price: e.target.value }))
                      }
                      className="w-full pl-8 pr-3 py-2.5 bg-secondary/40 border border-border rounded-xl text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-muted-foreground mb-1.5 uppercase tracking-wide">
                    Discount Price (₦) *
                  </label>
                  <div className="relative">
                    <Tag
                      size={13}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-primary"
                    />
                    <input
                      type="number"
                      min="0"
                      placeholder="e.g. 3500"
                      value={form.discounted_price}
                      onChange={(e) =>
                        setForm((f) => ({
                          ...f,
                          discounted_price: e.target.value,
                        }))
                      }
                      className="w-full pl-8 pr-3 py-2.5 bg-secondary/40 border border-border rounded-xl text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                    />
                  </div>
                </div>
              </div>

              {/* Live discount preview */}
              {form.main_price && form.discounted_price &&
                parseFloat(form.main_price) > 0 &&
                parseFloat(form.discounted_price) > 0 &&
                parseFloat(form.discounted_price) < parseFloat(form.main_price) && (
                  <div className="bg-primary/10 border border-primary/20 rounded-xl px-3 py-2 flex items-center gap-2">
                    <Star size={13} className="text-primary" />
                    <p className="text-xs text-primary font-medium">
                      {Math.round(
                        ((parseFloat(form.main_price) -
                          parseFloat(form.discounted_price)) /
                          parseFloat(form.main_price)) *
                          100
                      )}
                      % discount · Customer saves{" "}
                      {formatPrice(
                        Math.round(
                          parseFloat(form.main_price) -
                            parseFloat(form.discounted_price)
                        )
                      )}
                    </p>
                  </div>
                )}

              {/* Image URL / Upload */}
              <div>
                <label className="block text-xs font-semibold text-muted-foreground mb-1.5 uppercase tracking-wide">
                  Image
                </label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <ImageIcon
                      size={13}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                    />
                    <input
                      type="url"
                      placeholder="Image URL or upload..."
                      value={form.image_url}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, image_url: e.target.value }))
                      }
                      className="w-full pl-8 pr-3 py-2.5 bg-secondary/40 border border-border rounded-xl text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                    />
                  </div>
                  <div className="relative flex-shrink-0">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      disabled={uploadingImg}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
                    />
                    <div className={`px-4 py-2.5 rounded-xl text-sm font-semibold flex items-center gap-2 border transition-all h-full ${uploadingImg ? 'bg-secondary text-muted-foreground border-border' : 'bg-primary/10 text-primary border-primary/20 hover:bg-primary/20'}`}>
                      {uploadingImg ? <Loader2 size={16} className="animate-spin" /> : <Upload size={16} />}
                      <span className="hidden sm:inline">{uploadingImg ? 'Uploading...' : 'Upload'}</span>
                    </div>
                  </div>
                </div>
                {form.image_url && (
                  <div className="mt-2 rounded-xl overflow-hidden h-24 bg-secondary/30 border border-border/50">
                    <img
                      src={form.image_url}
                      alt="Preview"
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = "none";
                      }}
                    />
                  </div>
                )}
              </div>

              {/* Active toggle */}
              <div className="flex items-center justify-between px-3.5 py-3 bg-secondary/30 rounded-xl border border-border/50">
                <div>
                  <p className="text-sm font-medium text-foreground">
                    Active / Visible
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Show this deal to customers
                  </p>
                </div>
                <button
                  onClick={() =>
                    setForm((f) => ({ ...f, is_active: !f.is_active }))
                  }
                  className="flex-shrink-0"
                >
                  {form.is_active ? (
                    <ToggleRight size={28} className="text-green-400" />
                  ) : (
                    <ToggleLeft size={28} className="text-muted-foreground" />
                  )}
                </button>
              </div>

              {/* Error */}
              {error && (
                <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/30 px-3 py-2.5 rounded-xl">
                  <AlertCircle size={14} className="text-red-400 flex-shrink-0" />
                  <p className="text-xs text-red-400">{error}</p>
                </div>
              )}
            </div>

            {/* Footer Buttons */}
            <div className="px-5 pb-5 pt-3 border-t border-border/50 flex gap-3">
              <button
                onClick={closeModal}
                className="flex-1 py-2.5 rounded-xl text-sm font-medium bg-secondary/50 text-foreground hover:bg-secondary/70 transition-all border border-border/50"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex-1 py-2.5 rounded-xl text-sm font-semibold bg-primary text-primary-foreground hover:brightness-110 active:scale-[0.98] transition-all disabled:opacity-60 flex items-center justify-center gap-2"
              >
                {saving ? (
                  <>
                    <Loader2 size={14} className="animate-spin" />
                    Saving...
                  </>
                ) : editingId ? (
                  "Save Changes"
                ) : (
                  "Add Item"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminFeatured;
