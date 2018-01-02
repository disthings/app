import {iSyncManager} from "../src/model/i_sync_manager";
import {SyncManager} from "../__mocks__/model/MOCK_sync_manager";

const sm: iSyncManager = new SyncManager();

test("bla", () => {
	expect(sm).toBeDefined();
});