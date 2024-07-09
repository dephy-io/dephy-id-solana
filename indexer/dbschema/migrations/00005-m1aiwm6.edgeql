CREATE MIGRATION m1aiwm6m3sg7lyu7h7ww3hdjcbwedaiuec7k3lzq4hcshnxexphmsa
    ONTO m1y4v37muib7b3dndnsf45elqoyywj5azwwoksspwpj2crxet5uo2a
{
  CREATE GLOBAL default::currentAuthUserId -> std::uuid;
  CREATE TYPE default::AuthUser {
      CREATE REQUIRED PROPERTY is_admin: std::bool {
          SET default := false;
      };
  };
  CREATE GLOBAL default::currentAuthUser := (SELECT
      default::AuthUser
  FILTER
      (.id = GLOBAL default::currentAuthUserId)
  );
  ALTER TYPE default::Transaction {
      CREATE ACCESS POLICY auth_user_has_full_access
          ALLOW ALL USING (((GLOBAL default::currentAuthUser).is_admin ?? false)) {
              SET errmessage := 'Admin Only';
          };
      CREATE ACCESS POLICY non_admins_can_only_select
          ALLOW SELECT USING (NOT (((GLOBAL default::currentAuthUser).is_admin ?? false)));
  };
};
