import { GetServerSidePropsContext } from "next";
import { getSession } from "next-auth/react";
import Repository from "services/repository/repository";

export function getDefaultServerSideProps(
  enricher: (
    props: any,
    context: GetServerSidePropsContext,
    accountId?: string
  ) => any = (props) => props
) {
  return async (context: GetServerSidePropsContext) => {
    const session = await getSession(context);

    if (!session || !session.user || !session.user.email) {
      return {
        props: enricher({}, context),
      };
    }
    const repository = new Repository(session.user.email);

    try {
      return {
        props: enricher(
          {
            businessDetails: repository.getBusinessDetails(),
          },
          context,
          session.user.email
        ),
      };
    } catch (e) {
      console.error(e);

      return {
        props: {},
      };
    } finally {
      repository.closeDatabase();
    }
  };
}
