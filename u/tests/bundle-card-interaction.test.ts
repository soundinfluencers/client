import assert from "node:assert/strict";
import test from "node:test";

import {
    canToggleBundleFromCard,
    isBundleCardSurfaceClick,
} from "../src/entities/client-side/campaign-creator-page/bundle/ui/bundle-card/bundle-card.interactions.ts";

const clickTarget = (hasInteractiveAncestor: boolean): EventTarget => ({
    closest: () => hasInteractiveAncestor ? {} : null,
}) as unknown as EventTarget;

test("ordinary Bundle card surface delegates to the existing toggle", () => {
    assert.equal(isBundleCardSurfaceClick(clickTarget(false)), true);
});

test("Choose and Details descendants do not bubble into a second card toggle", () => {
    assert.equal(isBundleCardSurfaceClick(clickTarget(true)), false);
});

test("normal Bundle card can select and selected card can unselect", () => {
    assert.equal(
        canToggleBundleFromCard({
            isSelected: false,
            chooseDisabled: false,
            isIncludedInSelectedOffer: false,
        }),
        true,
    );
    assert.equal(
        canToggleBundleFromCard({
            isSelected: true,
            chooseDisabled: false,
            isIncludedInSelectedOffer: false,
        }),
        true,
    );
});

test("included or otherwise disabled unselected Bundle card cannot toggle", () => {
    assert.equal(
        canToggleBundleFromCard({
            isSelected: false,
            chooseDisabled: false,
            isIncludedInSelectedOffer: true,
        }),
        false,
    );
    assert.equal(
        canToggleBundleFromCard({
            isSelected: true,
            chooseDisabled: false,
            isIncludedInSelectedOffer: true,
        }),
        false,
    );
    assert.equal(
        canToggleBundleFromCard({
            isSelected: false,
            chooseDisabled: true,
            isIncludedInSelectedOffer: false,
        }),
        false,
    );
});
