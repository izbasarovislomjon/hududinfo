import { useState, useEffect, useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { MapPin, Save, ExternalLink } from "lucide-react";

// Fix leaflet marker icon
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

interface ObjectEditModalProps {
  object: {
    id: string;
    name: string;
    address: string;
    lat: number;
    lng: number;
  } | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSaved: () => void;
}

function LocationMarker({
  position,
  setPosition,
}: {
  position: [number, number];
  setPosition: (pos: [number, number]) => void;
}) {
  useMapEvents({
    click(e) {
      setPosition([e.latlng.lat, e.latlng.lng]);
    },
  });

  return <Marker position={position} />;
}

export function ObjectEditModal({
  object,
  open,
  onOpenChange,
  onSaved,
}: ObjectEditModalProps) {
  const [position, setPosition] = useState<[number, number]>([41.2995, 69.2401]);
  const [address, setAddress] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (object) {
      setPosition([object.lat, object.lng]);
      setAddress(object.address);
    }
  }, [object]);

  const handleSave = async () => {
    if (!object) return;

    setSaving(true);
    try {
      const { error } = await supabase
        .from("infrastructure_objects")
        .update({
          lat: position[0],
          lng: position[1],
          address: address,
        })
        .eq("id", object.id);

      if (error) throw error;

      toast.success("Koordinatalar saqlandi");
      onSaved();
      onOpenChange(false);
    } catch (error) {
      console.error("Error saving:", error);
      toast.error("Xatolik yuz berdi");
    } finally {
      setSaving(false);
    }
  };

  const openGoogleMaps = () => {
    const query = encodeURIComponent(`${object?.name}, ${object?.address}, Tashkent, Uzbekistan`);
    window.open(`https://www.google.com/maps/search/?api=1&query=${query}`, "_blank");
  };

  if (!object) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Koordinatalarni tahrirlash
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <h3 className="font-semibold text-lg">{object.name}</h3>
            <p className="text-sm text-muted-foreground">{object.address}</p>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={openGoogleMaps}
            className="gap-2"
          >
            <ExternalLink className="h-4 w-4" />
            Google Maps da ochish
          </Button>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Kenglik (Latitude)</Label>
              <Input
                type="number"
                step="0.000001"
                value={position[0]}
                onChange={(e) => setPosition([parseFloat(e.target.value) || 0, position[1]])}
              />
            </div>
            <div className="space-y-2">
              <Label>Uzunlik (Longitude)</Label>
              <Input
                type="number"
                step="0.000001"
                value={position[1]}
                onChange={(e) => setPosition([position[0], parseFloat(e.target.value) || 0])}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Manzil</Label>
            <Input
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Manzilni kiriting..."
            />
          </div>

          <div className="space-y-2">
            <Label>Xaritadan joy tanlang</Label>
            <p className="text-xs text-muted-foreground">
              Xaritada istalgan joyni bosib, koordinatalarni belgilang
            </p>
            <div className="h-[300px] rounded-lg overflow-hidden border">
              <MapContainer
                center={position}
                zoom={16}
                style={{ height: "100%", width: "100%" }}
              >
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <LocationMarker position={position} setPosition={setPosition} />
              </MapContainer>
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Bekor qilish
            </Button>
            <Button onClick={handleSave} disabled={saving} className="gap-2">
              <Save className="h-4 w-4" />
              {saving ? "Saqlanmoqda..." : "Saqlash"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
