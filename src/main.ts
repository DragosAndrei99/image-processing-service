import { ClusterService } from "./clusterize/clusterize.service";
import { bootstrap } from "./server";

const clusterService = new ClusterService();

clusterService.clusterize(bootstrap);
