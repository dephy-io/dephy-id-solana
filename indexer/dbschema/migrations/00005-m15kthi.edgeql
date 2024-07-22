CREATE MIGRATION m15kthikemftuzpiq3klfmggarwau2g7qffcsytvaqxwm4cgie2v4a
    ONTO m1y4v37muib7b3dndnsf45elqoyywj5azwwoksspwpj2crxet5uo2a
{
  CREATE GLOBAL default::current_auth_user_id -> std::uuid;
  CREATE TYPE default::AuthUser {
      CREATE REQUIRED PROPERTY is_admin: std::bool {
          SET default := false;
      };
  };
  CREATE ALIAS default::current_auth_user := (
      SELECT
          default::AuthUser
      FILTER
          (.id = GLOBAL default::current_auth_user_id)
  );
  ALTER TYPE default::Transaction {
      CREATE ACCESS POLICY auth_user_has_full_access
          ALLOW ALL USING ((default::current_auth_user.is_admin ?? false)) {
              SET errmessage := 'Admin Only';
          };
      CREATE ACCESS POLICY non_admins_can_only_select
          ALLOW SELECT USING (NOT ((default::current_auth_user.is_admin ?? false)));
  };
};
