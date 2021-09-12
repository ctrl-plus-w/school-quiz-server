import registerAssociations from "./database/registerAssociations";
import seedDatabase from "./database/seedDatabase";

(async () => {
    await registerAssociations();
    await seedDatabase();  
})()