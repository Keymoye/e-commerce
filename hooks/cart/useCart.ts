import { CartStore } from "@/store/cartStore";
import { useToast } from "@/components/ui/toast";
import { Product } from "@/types/product";

export function useCart({ product }: { product: Product }) {
  const addItem = CartStore((s) => s.addItem);
  const updateQuantity = CartStore((s) => s.updateQuantity);
  const removeItem = CartStore((s) => s.removeItem);
  const quantity = CartStore(
    (s) => s.items.find((i) => i.id === product.id)?.quantity ?? 0
  );

  const { toast } = useToast(); // ✅ Initialize toast hook

  const handleAdd = () => {
    if (quantity) {
      updateQuantity(product.id, quantity + 1);
      toast({
        title: "Quantity Updated",
        description: `Increased ${product.name} to ${quantity + 1}`,
        duration: 2000,
      });
    } else {
      addItem(product, 1);
      toast({
        title: "Item Added",
        description: `${product.name} added to your cart.`,
        duration: 2000,
      });
    }
  };

  const handleSub = () => {
    if (quantity <= 1) {
      removeItem(product.id);
      toast({
        title: "Item Removed",
        description: `${product.name} removed from your cart.`,
        duration: 2000,
      });
    } else {
      updateQuantity(product.id, quantity - 1);
      toast({
        title: "Quantity Updated",
        description: `Reduced ${product.name} to ${quantity - 1}`,
        duration: 2000,
      });
    }
  };
  return { handleSub, handleAdd, quantity, product };
}
