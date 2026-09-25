import { Coins, Check } from "lucide-react";
import { cn } from "cn";
import { useFocusOnMount } from "../../hooks/useFocusOnMount";
import { useAppState } from "../../state/AppStateContext";
import { SHOP_CATALOGUE, type ShopCategory } from "../../shop/catalogue";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";

const CATEGORY_LABEL: Record<ShopCategory, string> = {
  theme: "Themes",
  cardStyle: "Card Styles",
  avatar: "Avatars",
  celebration: "Celebrations",
  soundPack: "Sound Packs",
};

const CATEGORIES: ShopCategory[] = [
  "theme",
  "cardStyle",
  "avatar",
  "celebration",
  "soundPack",
];

export function ShopScreen() {
  const { state, dispatch } = useAppState();
  const headingRef = useFocusOnMount<HTMLHeadingElement>();
  const shop = state.saveData?.shop;
  const coins = state.saveData?.wallet.coins ?? 0;

  if (!shop) return null;

  return (
    <main className="screen shop-screen relative mx-auto max-w-2xl p-6">
      <div className="flex items-center justify-between">
        <h1 ref={headingRef} tabIndex={-1} className="text-2xl font-bold">
          Shop
        </h1>
        <Badge variant="secondary" className="coin-badge gap-1 px-3 py-1.5 text-sm">
          <Coins className="size-4" /> {coins}
        </Badge>
      </div>
      {CATEGORIES.map((category) => (
        <fieldset key={category} className="mt-6">
          <legend className="mb-2 text-sm font-semibold text-muted-foreground">
            {CATEGORY_LABEL[category]}
          </legend>
          <div className="shop-items flex flex-col gap-2">
            {SHOP_CATALOGUE.filter((item) => item.category === category).map(
              (item) => {
                const owned = shop.ownedItemIds.includes(item.id);
                const equipped =
                  category === "avatar"
                    ? shop.equipped.avatar === item.id
                    : shop.equipped[category] === item.id;
                return (
                  <div
                    key={item.id}
                    className={cn(
                      "shop-item flex items-center justify-between gap-3 rounded-lg border border-border bg-card p-3",
                      equipped && "border-primary",
                    )}
                  >
                    <span className="font-medium">{item.name}</span>
                    <div className="flex items-center gap-2">
                      {!owned && (
                        <span className="flex items-center gap-1 text-sm text-muted-foreground">
                          <Coins className="size-3.5" /> {item.costCoins}
                        </span>
                      )}
                      {!owned ? (
                        <Button
                          size="sm"
                          disabled={coins < item.costCoins}
                          onClick={() =>
                            dispatch({ type: "SHOP_PURCHASE", itemId: item.id })
                          }
                        >
                          Buy
                        </Button>
                      ) : equipped ? (
                        <Badge className="gap-1">
                          <Check className="size-3.5" /> Equipped
                        </Badge>
                      ) : (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() =>
                            dispatch({ type: "SHOP_EQUIP", itemId: item.id })
                          }
                        >
                          Equip
                        </Button>
                      )}
                    </div>
                  </div>
                );
              },
            )}
          </div>
        </fieldset>
      ))}
      <div className="screen-actions mt-6">
        <Button
          variant="outline"
          onClick={() => dispatch({ type: "NAVIGATE", screen: "main-menu" })}
        >
          Back
        </Button>
      </div>
    </main>
  );
}
