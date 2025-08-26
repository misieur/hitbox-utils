# HitBox Utils,
## A BlockBench Plugin made to create and edit hitbox models Made by Misieur
<p align="center">
  <img width="720" height="516" alt="image" src="https://github.com/user-attachments/assets/cac340c4-3e3b-4640-8a3c-01e67f54bc8f" />
</p><br>

## How to install
See https://github.com/misieur/hitbox-utils/releases

<br>

## How to use it (for plugin developers)
Here is an example of how to use the file in Java using the Bukkit API you can also look at the generated files it is just json the generated elements are the one you need to use ingame not in blockbench everything is handled byt he BB plugin.

### Java

```Java
public static void spawnHitBox(JsonObject hitboxData, Location spawnLocation) {
  String type = hitboxData.get("type").getAsString();
  JsonArray hitboxArray = hitboxData.get("hitboxes").getAsJsonArray();
  switch (type) {
    case "entity" ->
        hitboxArray.forEach(jsonElement -> {  // You can also use happy ghasts here I am using shulkers riding item displays because it works on 1.21.2+ (below shulkers are not completely invisible)
          JsonObject position = jsonElement.getAsJsonObject().get("position").getAsJsonObject();
          ItemDisplay itemDisplay = (ItemDisplay) spawnLocation.getWorld().spawnEntity(spawnLocation.clone().add(position.get("x").getAsFloat(), position.get("y").getAsFloat(), position.get("z").getAsFloat()), EntityType.ITEM_DISPLAY);
          Shulker shulkerEntity = (Shulker) spawnLocation.getWorld().spawnEntity(spawnLocation.clone().add(position.get("x").getAsFloat(), position.get("y").getAsFloat(), position.get("z").getAsFloat()), EntityType.SHULKER);
          itemDisplay.addPassenger(shulkerEntity);
          shulkerEntity.getAttribute(Attribute.GENERIC_SCALE).setBaseValue(jsonElement.getAsJsonObject().get("size").getAsFloat());
          shulkerEntity.setAI(false);
          shulkerEntity.addPotionEffect(new PotionEffect(PotionEffectType.INVISIBILITY, PotionEffect.INFINITE_DURATION, 0, false, false));
          shulkerEntity.setInvulnerable(true);
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
