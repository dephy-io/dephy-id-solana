CREATE MIGRATION m1dpxkogxfvmuai6l4jp4mv727vip2ys7abenahh3r66bmsygjva4q
    ONTO m1r56uiyf3evxkharcfm5ohxytt4l27epqwbxghc4grliqnr56taga
{
  ALTER TYPE default::Product {
      CREATE PROPERTY devices_count := (std::count(__source__.devices));
  };
  ALTER TYPE default::User {
      CREATE PROPERTY dids_count := (std::count(__source__.dids));
  };
  ALTER TYPE default::Vendor {
      CREATE PROPERTY products_count := (std::count(__source__.products));
  };
};
