import {iSyncManager} from "../src/model/i_synchronization_manager";
import {SyncManager} from "../__mocks__/model/mock_sync_manager";

const sm: iSyncManager = new SyncManager();

test("bla", () => {
	expect(sm).toBeDefined();
});