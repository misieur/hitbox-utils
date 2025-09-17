# HitBox Utils,
## A BlockBench Plugin made to create and edit hitbox models Made by Misieur
<p align="center">
  <img width="720" height="516" alt="image" src="https://github.com/user-attachments/assets/cac340c4-3e3b-4640-8a3c-01e67f54bc8f" />
</p><br>

## How to install
See https://github.com/misieur/hitbox-utils/releases

<br>

## How to use it (for plugin developers)
Here is an example of how to use the file in Java using the Bukkit API. You can also look at the generated files it is just json, the generated data are the one you need to use ingame not made for blockbench, everything is handled by the blockbench plugin.

### Java

```Java
public static void spawnHitBox(JsonObject hitboxData, Location spawnLocation) {
  String type = hitboxData.get("type").getAsString();
  JsonArray hitboxArray = hitboxData.get("hitboxes").getAsJsonArray();
  switch (type) {
    case "entity" ->
        hitboxArray.forEach(jsonElement -> {  // You can also use happy ghasts here I am using shulkers riding item displays because it works on 1.21.2+ (below shulkers are not completely invisible)
          if (jsonElement.getAsJsonObject().get("shulker_only") != null && jsonElement.getAsJsonObject().get("shulker_only").getAsBoolean()) {
            JsonObject position = jsonElement.getAsJsonObject().get("position").getAsJsonObject();
            ItemDisplay itemDisplay = (ItemDisplay) spawnLocation.getWorld().spawnEntity(spawnLocation.clone().add(position.get("x").getAsFloat(), position.get("y").getAsFloat(), position.get("z").getAsFloat()), EntityType.ITEM_DISPLAY);
            Shulker shulkerEntity = (Shulker) spawnLocation.getWorld().spawnEntity(spawnLocation.clone().add(position.get("x").getAsFloat(), position.get("y").getAsFloat(), position.get("z").getAsFloat()), EntityType.SHULKER);
            itemDisplay.addPassenger(shulkerEntity);
            shulkerEntity.getAttribute(Attribute.SCALE).setBaseValue(jsonElement.getAsJsonObject().get("size").getAsFloat());
            BlockFace blockFace = switch (jsonElement.getAsJsonObject().get("face").getAsInt()) { // In Minecraft they use numbers but not using bukkit
              case 3 -> BlockFace.NORTH;
              case 5 -> BlockFace.WEST;
              default -> BlockFace.DOWN;
            };
            shulkerEntity.setAttachedFace(blockFace);
            float peek = jsonElement.getAsJsonObject().get("height").getAsInt()/-100f;
            shulkerEntity.setPeek(peek);
            shulkerEntity.setAI(false);
            //shulkerEntity.addPotionEffect(new PotionEffect(PotionEffectType.INVISIBILITY, PotionEffect.INFINITE_DURATION, 0, false, false));
            shulkerEntity.setInvulnerable(true);
          } else {
            JsonObject position = jsonElement.getAsJsonObject().get("position").getAsJsonObject();
            HappyGhast happyGhast = (HappyGhast) spawnLocation.getWorld().spawnEntity(spawnLocation.clone().add(position.get("x").getAsFloat(), position.get("y").getAsFloat(), position.get("z").getAsFloat()), EntityType.HAPPY_GHAST);
            happyGhast.getAttribute(Attribute.SCALE).setBaseValue(jsonElement.getAsJsonObject().get("size").getAsFloat() * 0.25);
            happyGhast.setAI(false);
            happyGhast.setInvulnerable(true);
          }
        });
    case "block" -> hitboxArray.forEach(jsonElement -> {
      JsonObject position = jsonElement.getAsJsonObject().get("position").getAsJsonObject();
      spawnLocation.getWorld().setType(spawnLocation.clone().add(position.get("x").getAsFloat(), position.get("y").getAsFloat(), position.get("z").getAsFloat()), Material.BARRIER);
    });
    case "interaction" -> hitboxArray.forEach(jsonElement -> {
      JsonObject position = jsonElement.getAsJsonObject().get("position").getAsJsonObject();
      Interaction entity = (Interaction) spawnLocation.getWorld().spawnEntity(spawnLocation.clone().add(position.get("x").getAsFloat(), position.get("y").getAsFloat(), position.get("z").getAsFloat()), EntityType.INTERACTION);
      entity.setInteractionHeight(jsonElement.getAsJsonObject().get("height").getAsFloat());
      entity.setInteractionWidth(jsonElement.getAsJsonObject().get("width").getAsFloat());
    });
  }
}
```
