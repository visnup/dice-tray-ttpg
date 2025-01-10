import type { GameObject } from "@tabletop-playground/api";
import {
  refObject as _refObject,
  refPackageId as _refPackageId,
  Dice,
  globalEvents,
  Vector,
  world,
} from "@tabletop-playground/api";

const refObject = _refObject;

// Zone
const zoneId = `zone-${refObject.getId()}`;
const zone =
  world.getZoneById(zoneId) ?? world.createZone(refObject.getPosition());
zone.setId(zoneId);
zone.setPosition(refObject.getPosition());
zone.setRotation(refObject.getRotation());
zone.setScale(refObject.getSize().add(new Vector(0, 0, 3)));
zone.onBeginOverlap.add((zone, obj) => {
  if (obj instanceof Dice) obj.onPrimaryAction.add(onRoll);
});
zone.onEndOverlap.add((zone, obj) => {
  if (obj instanceof Dice) obj.onPrimaryAction.remove(onRoll);
});
refObject.onMovementStopped.add(() => {
  zone.setPosition(refObject.getPosition());
  zone.setRotation(refObject.getRotation());
});
refObject.onDestroyed.add(() => zone.destroy());

// Put up guard walls when dice are rolled
let walls: GameObject | undefined;
function onRoll() {
  if (!walls) {
    walls = world.createObjectFromTemplate(
      "5DC351479A4DF3A83EAD41A21E9F33B8",
      refObject.getPosition().add(new Vector(0, 0, refObject.getSize().z)),
    );
    walls!.toggleLock();
  }
}

// Bring down walls after
globalEvents.onDiceRolled.add(() => {
  walls?.destroy();
  walls = undefined;
});
