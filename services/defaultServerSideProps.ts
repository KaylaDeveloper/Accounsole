import { GetServerSidePropsContext } from "next";
import { getSession } from "next-auth/react";
import Repository from "services/repository/Repository";
import path from "path";

export function getDefaultServerSideProps(
  enricher: (
    // eslint-disable-next-line unused-imports/no-unused-vars
    props: any,
    // eslint-disable-next-line unused-imports/no-unused-vars
    context: GetServerSidePropsContext,
    // eslint-disable-next-line unused-imports/no-unused-vars
    repository?: Repository
  ) => any = (props) => props
) {
  return async (context: GetServerSidePropsContext) => {
    const session = await getSession(context);

    if (!session || !session.user || !session.user.email) {
      return {
        props: enricher({}, context),
      };
    }
    const acountDatabasePath = path.join(
      process.cwd(),
      process.env.SQLITE__ACCOUNT_DB__FOLDER_PATH as string,
      `account-${session?.user?.email}.db`
    );
    const repository = new Repository(acountDatabasePath);

    try {
      return {
        props: enricher(
          {
            businessDetails: repository.getBusinessDetails(),
          },
          context,
          repository
        ),
      };
    } catch (e) {
      console.error(e);

      return {
        props: enricher({}, context),
      };
    } finally {
      repository.closeDatabase();
    }
  };
}
