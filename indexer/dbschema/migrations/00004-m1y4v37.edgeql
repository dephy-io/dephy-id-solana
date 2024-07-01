CREATE MIGRATION m1y4v37muib7b3dndnsf45elqoyywj5azwwoksspwpj2crxet5uo2a
    ONTO m16hmfhcgsxehqt6kfgbb45zwaz3grmiw542n2uml36aug4dzrezya
{
  ALTER TYPE default::Product {
      ALTER PROPERTY devices_count {
          USING (std::count(.devices));
      };
  };
  ALTER TYPE default::Vendor {
      CREATE REQUIRED LINK program: default::Program {
          SET REQUIRED USING (SELECT
              default::Program 
          LIMIT
              1
          );
      };
      CREATE PROPERTY devices_count := (std::count(.products.devices));
      ALTER PROPERTY products_count {
          USING (std::count(.products));
      };
  };
  ALTER TYPE default::Program {
      CREATE MULTI LINK vendors := (.<program[IS default::Vendor]);
      CREATE PROPERTY devices_count := (std::count(.vendors.products.devices));
      CREATE PROPERTY products_count := (std::count(.vendors.products));
      CREATE PROPERTY vendors_count := (std::count(.vendors));
  };
  ALTER TYPE default::User {
      ALTER PROPERTY dids_count {
          USING (std::count(.dids));
      };
  };
};
